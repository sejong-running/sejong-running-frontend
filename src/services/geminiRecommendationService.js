import { GoogleGenAI } from "@google/genai";
import { getAllCourses } from "./coursesService";

// Gemini API 클라이언트 초기화
const genAI = new GoogleGenAI({
    apiKey: process.env.REACT_APP_GEMINI_API_KEY,
});

// Gemini 컨텍스트 캐시 관리 (24시간 지속)
let cachedContextName = null;
let cacheCreatedAt = null;

/**
 * 코스 데이터로 컨텍스트 캐시 생성 (어드민용)
 * @returns {Promise<string>} 생성된 캐시 이름
 */
export const createCourseContextCache = async () => {
    try {
        console.log("🔄 코스 데이터로 컨텍스트 캐시 생성 시작...");

        const { data: courses, error } = await getAllCourses();
        if (error) {
            throw new Error(`코스 데이터를 가져오는데 실패했습니다: ${error}`);
        }

        // 간소화된 코스 데이터로 변환
        const simplifiedCourses = courses.map((course) => ({
            id: course.id,
            title: course.title,
            description: course.description,
            distance: course.distance,
            tags: course.tags || [],
            creatorName: course.creatorName,
            likesCount: course.likesCount,
        }));

        const systemPrompt = `
당신은 세종 러닝 코스 추천 전문가입니다. 다음은 사용 가능한 모든 러닝 코스 데이터입니다:

${JSON.stringify(simplifiedCourses, null, 2)}

중요: 사용자가 태그를 제공하면 무조건 3개의 코스를 추천해야 합니다. 
완전히 일치하는 태그가 없더라도, 유사하거나 관련성이 있는 코스를 찾아서 추천하세요.
예를 들어:
- 특정 감정 태그가 없으면 비슷한 분위기의 코스를 추천
- 특정 조건 태그가 없으면 일반적으로 적합한 코스를 추천
- 거리, 난이도, 위치 등을 고려해서라도 3개를 반드시 추천

추천 결과는 반드시 다음 JSON 형식으로만 응답하고, 다른 텍스트는 포함하지 마세요:

{
  "recommendations": [
    {
      "courseId": "코스ID",
      "courseName": "코스명",
      "reason": "추천 이유 (직접 매칭되지 않는 경우 유사성이나 일반적 적합성 설명)",
      "matchScore": 0.8,
      "matchedTags": ["매칭된", "태그들"]
    }
  ]
}
`;

        // 실제 Gemini 컨텍스트 캐시 생성
        const cacheResult = await genAI.caches.create({
            model: "gemini-2.0-flash",
            config: {
                contents: [
                    {
                        role: "user",
                        parts: [{ text: systemPrompt }],
                    },
                ],
                systemInstruction: "당신은 세종 러닝 코스 추천 전문가입니다.",
                ttl: "86400s", // 24시간 (최대값)
                displayName: "sejong-running-courses-cache",
            },
        });

        cachedContextName = cacheResult.name;
        cacheCreatedAt = new Date().toISOString();

        console.log(`✅ Gemini 컨텍스트 캐시 생성 완료: ${cachedContextName}`);
        console.log(
            `📊 총 ${simplifiedCourses.length}개 코스 데이터가 Gemini에 캐시됨`
        );
        console.log(`⏰ 캐시 생성 시간: ${cacheCreatedAt} (24시간 지속)`);

        return cachedContextName;
    } catch (error) {
        console.error("❌ 컨텍스트 캐시 생성 실패:", error);
        throw error;
    }
};

/**
 * 컨텍스트 캐시 상태 확인 함수
 * @returns {Object} 캐시 상태 정보
 */
export const getCacheStatus = () => {
    const minutesAgo = cacheCreatedAt
        ? Math.round(
              (Date.now() - new Date(cacheCreatedAt).getTime()) / 1000 / 60
          )
        : null;
    const hoursLeft = minutesAgo
        ? Math.max(0, 24 - Math.floor(minutesAgo / 60))
        : null;

    return {
        hasCache: !!cachedContextName,
        cacheName: cachedContextName,
        createdAt: cacheCreatedAt,
        duration: minutesAgo ? `${minutesAgo}분 전` : null,
        remainingTime: hoursLeft !== null ? `${hoursLeft}시간 남음` : null,
        isExpired: minutesAgo ? minutesAgo > 1440 : false, // 24시간 = 1440분
    };
};

/**
 * Gemini API를 사용하여 코스 추천을 받는 함수 (태그만 사용)
 * @param {Array} selectedTags - 사용자가 선택한 태그들
 * @returns {Promise<Object>} 추천 결과 객체
 */
export const getGeminiCourseRecommendations = async (selectedTags) => {
    try {
        // 입력 검증
        if (!selectedTags || selectedTags.length === 0) {
            throw new Error("선택된 태그가 없습니다.");
        }

        // 컨텍스트 캐시 확인
        const cacheStatus = getCacheStatus();
        console.log("📊 캐시 상태:", cacheStatus);

        if (!cacheStatus.hasCache || cacheStatus.isExpired) {
            // 자동으로 캐시 생성 시도
            console.log("🔄 캐시가 없어서 자동 생성을 시도합니다...");
            try {
                await createCourseContextCache();
                console.log("✅ 자동 캐시 생성 완료");
            } catch (cacheError) {
                console.error("❌ 자동 캐시 생성 실패:", cacheError);
                throw new Error(
                    "컨텍스트 캐시가 생성되지 않았습니다. 관리자 페이지에서 'AI 컨텍스트 업데이트'를 클릭해주세요."
                );
            }
        }

        // API 키 확인
        if (!process.env.REACT_APP_GEMINI_API_KEY) {
            throw new Error("API 키가 설정되지 않았습니다.");
        }

        console.log("🎯 캐시된 컨텍스트로 추천 요청 시작...");
        console.log("선택된 태그:", selectedTags);
        console.log("사용할 캐시:", cachedContextName);

        // 강제 추천 요청 프롬프트
        const userPrompt = `
사용자가 선택한 태그: ${selectedTags.join(", ")}

무조건 3개의 러닝 코스를 추천해주세요. 
완전히 일치하는 태그가 없더라도:
1. 유사한 특성이나 분위기를 가진 코스
2. 일반적으로 인기있거나 추천할만한 코스
3. 거리나 난이도 등 다른 요소를 고려한 코스
위 방식으로라도 반드시 3개를 추천하세요.

각 코스가 왜 추천되는지 구체적 이유도 포함해주세요.
반드시 JSON 형식으로만 응답해주세요.
`;

        console.log("📝 사용자 프롬프트:", userPrompt);

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

        // 캐시된 컨텍스트를 사용하여 API 호출 (타임아웃 포함)
        const apiPromise = genAI.models.generateContent({
            model: "gemini-2.0-flash",
            contents: [{ role: "user", parts: [{ text: userPrompt }] }],
            config: {
                cachedContent: cachedContextName,
            },
        });
        const result = await Promise.race([apiPromise, timeoutPromise]);
        const text = result.text;

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
            
            // Gemini가 매칭되는 코스가 없다고 응답한 경우 처리
            if (text.includes('관련된 코스가 없습니다') || 
                text.includes('추천하는 것은 어렵습니다') ||
                text.includes('죄송합니다')) {
                throw new Error("선택한 태그와 일치하는 코스를 찾을 수 없습니다. 다른 태그를 선택해 보세요.");
            }
            
            throw new Error("AI 응답을 처리할 수 없습니다. 잠시 후 다시 시도해 주세요.");
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

        // 추천된 코스들을 실제 DB 데이터와 매칭
        const { data: allCourses } = await getAllCourses();
        const enrichedRecommendations = recommendations.recommendations.map(
            (rec) => {
                // courseId나 courseName으로 실제 코스 찾기
                const courseInfo = allCourses?.find(
                    (course) =>
                        course.id.toString() === rec.courseId.toString() ||
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
                totalCourses: allCourses?.length || 0,
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
