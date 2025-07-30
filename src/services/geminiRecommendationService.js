import { GoogleGenerativeAI } from "@google/generative-ai";
import { generateCourseRecommendationPrompt } from "../prompts/courseRecommendationPrompt";

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenerativeAI(process.env.REACT_APP_GEMINI_API_KEY);

/**
 * Gemini API를 사용하여 코스 추천을 받는 함수
 * @param {Array} selectedTags - 사용자가 선택한 태그들
 * @param {Array} courseData - 전체 코스 데이터
 * @returns {Promise<Object>} 추천 결과 객체
 */
export const getGeminiCourseRecommendations = async (
    selectedTags,
    courseData
) => {
    try {
        // 입력 검증
        if (!selectedTags || selectedTags.length === 0) {
            throw new Error("선택된 태그가 없습니다.");
        }

        if (!courseData || courseData.length === 0) {
            throw new Error("코스 데이터가 없습니다.");
        }

        // API 키 확인
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
            throw new Error("API 키가 설정되지 않았습니다.");
        }

        console.log("🎯 추천 요청 시작...");
        console.log("선택된 태그:", selectedTags);
        console.log("코스 데이터 개수:", courseData.length);

        // 코스 데이터를 간소화 (id, title, tags만 포함)
        const simplifiedCourseData = courseData.map((course) => ({
            id: course.id,
            title: course.title,
            tags: course.tags || [],
        }));

        console.log(
            "📝 간소화된 코스 데이터:",
            simplifiedCourseData.length,
            "개"
        );

        // Gemini 모델 가져오기
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

        // 프롬프트 생성 (간소화된 데이터 사용)
        const prompt = generateCourseRecommendationPrompt(
            selectedTags,
            simplifiedCourseData
        );

        console.log("📝 생성된 프롬프트:", prompt.substring(0, 200) + "...");

        // 10초 타임아웃 설정
        const timeoutPromise = new Promise((_, reject) => {
            setTimeout(() => {
                reject(
                    new Error(
                        "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
                    )
                );
            }, 10000);
        });

        // API 호출 (타임아웃 포함)
        const apiPromise = model.generateContent(prompt);
        const result = await Promise.race([apiPromise, timeoutPromise]);
        const response = await result.response;
        const text = response.text();

        console.log("🤖 원본 응답:", text);

        // JSON 파싱
        let recommendations;
        try {
            // JSON 코드 블록에서 내용 추출
            const jsonMatch = text.match(/```json\s*([\s\S]*?)\s*```/);
            if (jsonMatch) {
                recommendations = JSON.parse(jsonMatch[1]);
            } else {
                // 코드 블록이 없는 경우 전체 텍스트를 JSON으로 파싱 시도
                recommendations = JSON.parse(text);
            }
        } catch (parseError) {
            console.error("❌ JSON 파싱 실패:", parseError);
            console.error("원본 응답:", text);
            throw new Error("응답을 처리할 수 없습니다.");
        }

        // 응답 검증
        if (
            !recommendations.recommendations ||
            !Array.isArray(recommendations.recommendations)
        ) {
            throw new Error("추천 결과 형식이 올바르지 않습니다.");
        }

        if (recommendations.recommendations.length !== 3) {
            console.warn(
                "⚠️ 추천 개수가 3개가 아닙니다:",
                recommendations.recommendations.length
            );
        }

        // 코스 데이터와 매칭하여 완전한 정보 포함
        const enrichedRecommendations = recommendations.recommendations.map(
            (rec) => {
                const courseInfo = courseData.find(
                    (course) =>
                        course.id === rec.courseId ||
                        course.title === rec.courseName
                );

                return {
                    ...rec,
                    courseInfo: courseInfo || null,
                };
            }
        );

        const finalResult = {
            ...recommendations,
            recommendations: enrichedRecommendations,
            metadata: {
                selectedTags,
                timestamp: new Date().toISOString(),
                totalCourses: courseData.length,
            },
        };

        console.log("✅ 추천 완료:", finalResult);
        return finalResult;
    } catch (error) {
        console.error("❌ 추천 서비스 오류:", error);

        // 에러 타입별 처리
        if (error.message.includes("API_KEY")) {
            throw new Error(
                "API 키가 올바르지 않습니다. 환경변수를 확인해주세요."
            );
        } else if (error.message.includes("quota")) {
            throw new Error("API 사용량 한도를 초과했습니다.");
        } else if (error.message.includes("network")) {
            throw new Error("네트워크 연결에 문제가 있습니다.");
        } else if (
            error.message.includes("overloaded") ||
            error.message.includes("503")
        ) {
            throw new Error(
                "서비스가 일시적으로 사용할 수 없습니다. 잠시 후 다시 시도해주세요."
            );
        } else if (error.message.includes("시간이 초과")) {
            throw new Error(
                "요청 시간이 초과되었습니다. 잠시 후 다시 시도해주세요."
            );
        }

        throw error;
    }
};

/**
 * 추천 결과 검증 함수
 * @param {Object} recommendations - 추천 결과
 * @returns {boolean} 검증 결과
 */
export const validateRecommendations = (recommendations) => {
    if (!recommendations || typeof recommendations !== "object") {
        return false;
    }

    if (
        !recommendations.recommendations ||
        !Array.isArray(recommendations.recommendations)
    ) {
        return false;
    }

    // 각 추천 항목 검증
    return recommendations.recommendations.every(
        (rec) =>
            rec.courseId &&
            rec.courseName &&
            rec.reason &&
            typeof rec.matchScore === "number" &&
            Array.isArray(rec.matchedTags)
    );
};
