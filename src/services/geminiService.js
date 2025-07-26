// Gemini API 서비스
const GEMINI_API_KEY = process.env.REACT_APP_GEMINI_API_KEY;
const GEMINI_API_URL = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

/**
 * Gemini API에 프롬프트를 보내고 응답을 받는 함수
 * @param {string} prompt - Gemini에게 보낼 프롬프트
 * @returns {Promise<Object>} API 응답 결과
 */
export const sendPromptToGemini = async (prompt) => {
    try {
        if (!GEMINI_API_KEY) {
            throw new Error('GEMINI_API_KEY가 설정되지 않았습니다. .env 파일을 확인해주세요.');
        }

        const requestBody = {
            contents: [
                {
                    parts: [
                        {
                            text: prompt
                        }
                    ]
                }
            ]
        };

        console.log('Gemini API 요청 시작:', prompt);

        const response = await fetch(`${GEMINI_API_URL}?key=${GEMINI_API_KEY}`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody)
        });

        if (!response.ok) {
            const errorData = await response.text();
            throw new Error(`API 요청 실패: ${response.status} - ${errorData}`);
        }

        const data = await response.json();
        console.log('Gemini API 응답 전체:', data);

        // 응답에서 텍스트 추출
        const generatedText = data.candidates?.[0]?.content?.parts?.[0]?.text || '응답을 받지 못했습니다.';
        
        console.log('Gemini 응답 텍스트:', generatedText);

        return {
            success: true,
            data: {
                text: generatedText,
                fullResponse: data
            }
        };

    } catch (error) {
        console.error('Gemini API 오류:', error);
        return {
            success: false,
            error: error.message,
            data: null
        };
    }
};

/**
 * 러닝 코스 추천을 위한 특화된 프롬프트 함수
 * @param {Array} courses - 코스 배열
 * @param {string} userPreference - 사용자 선호도 (예: "짧은 거리", "공원", "강변" 등)
 * @returns {Promise<Object>} 추천 결과
 */
export const getRunningCourseRecommendation = async (courses, userPreference = '') => {
    const courseList = courses.map(course => 
        `${course.title} (${course.distance}km) - ${course.description}`
    ).join('\n');

    const prompt = `
다음은 러닝 코스 목록입니다:

${courseList}

사용자 선호도: ${userPreference || '특별한 선호도 없음'}

위 코스들 중에서 3개를 추천하고, 각각에 대해 추천 이유를 한국어로 간단히 설명해주세요.
형식:
1. [코스명] - [추천 이유]
2. [코스명] - [추천 이유]  
3. [코스명] - [추천 이유]
`;

    return await sendPromptToGemini(prompt);
};

/**
 * 테스트용 간단한 프롬프트 함수
 * @returns {Promise<Object>} 테스트 결과
 */
export const testGeminiConnection = async () => {
    const testPrompt = "안녕하세요! 간단히 인사말로 답해주세요.";
    console.log('Gemini 연결 테스트 시작...');
    
    const result = await sendPromptToGemini(testPrompt);
    
    if (result.success) {
        console.log('✅ Gemini API 연결 성공!');
    } else {
        console.log('❌ Gemini API 연결 실패:', result.error);
    }
    
    return result;
};