# Gemini API 기반 코스 추천 시스템

## 개요

이 프로젝트는 Google Gemini AI를 활용하여 사용자의 선호도에 맞는 러닝 코스를 추천하는 시스템입니다. 사용자가 선택한 태그를 기반으로 개인화된 러닝 코스 3개를 추천하며, AI가 각 추천의 이유와 매칭도 점수를 제공합니다.

## 핵심 기능

### 1. 태그 기반 추천

-   사용자는 기분/목적, 동반자, 운동시간, 시간대, 풍경, 강도 등 6개 카테고리에서 태그 선택
-   총 26개의 세분화된 태그 옵션 제공
-   시간 관련 카테고리는 중복 선택 방지 로직 적용

### 2. AI 기반 개인화 추천

-   Gemini 1.5 Flash 모델을 사용하여 실시간 추천 생성
-   각 추천마다 이유, 매칭 점수(1-100), 매칭된 태그 정보 제공
-   코스 데이터와 연결하여 완전한 정보 표시

### 3. 추천 결과 시각화

-   추천된 코스의 지도 경로 표시 (KakaoMap 연동)
-   AI 추천 배지와 매칭된 태그 하이라이팅
-   상세 정보 및 지도 보기 기능

## 기술 스택

### Frontend

-   **React** 19.1.0 - 메인 프론트엔드 프레임워크
-   **React Router DOM** 7.7.0 - 페이지 라우팅
-   **CSS3** - 스타일링 (별도 CSS 프레임워크 없이 순수 CSS 사용)

### AI & API

-   **Google Generative AI** (@google/generative-ai 0.24.1) - Gemini API 클라이언트
-   **Gemini 1.5 Flash** - AI 추천 모델

### 데이터베이스 & 백엔드

-   **Supabase** (@supabase/supabase-js 2.52.0) - 백엔드 서비스 및 PostgreSQL 데이터베이스
-   **PostGIS** - 지리정보 데이터 처리

### 지도 서비스

-   **Kakao Map API** - 코스 경로 시각화

### 개발 도구

-   **Create React App** - 프로젝트 설정 및 빌드
-   **React Testing Library** - 테스트 도구

## 아키텍처

### 파일 구조

```
src/
├── services/
│   ├── geminiRecommendationService.js  # Gemini API 통신 로직
│   └── coursesService.js              # 코스 데이터 관리
├── prompts/
│   └── courseRecommendationPrompt.js  # AI 프롬프트 템플릿
├── components/
│   └── shared/
│       ├── TagSelector.jsx      # 태그 선택 UI
│       └── RecommendationCard.jsx     # 추천 결과 카드
├── pages/
│   └── RunPage.jsx                    # 메인 추천 페이지
└── data/
    └── runningTags.js                 # 태그 데이터 및 색상 정의
```

### 데이터 플로우

1. **태그 선택** (TagSelector)

    - 사용자가 러닝 선호도 태그 선택
    - 시간 관련 태그는 단일 선택 제한

2. **추천 요청** (geminiRecommendationService)

    - 선택된 태그와 전체 코스 데이터를 Gemini API로 전송
    - 구조화된 프롬프트를 통해 JSON 형태 응답 요청

3. **AI 처리**

    - Gemini 1.5 Flash 모델이 태그와 코스 데이터 분석
    - 3개 코스 추천 및 각각의 매칭 점수, 이유 생성

4. **결과 표시** (RecommendationCard)
    - AI 추천 결과를 사용자 친화적으로 표시
    - 지도 경로, 매칭 태그, 코스 정보 통합 표시

## 주요 컴포넌트 설명

### 1. geminiRecommendationService.js

```javascript
// 핵심 기능: Gemini API 통신 및 응답 처리
export const getGeminiCourseRecommendations = async(selectedTags, courseData);
```

-   **입력 검증**: 태그 선택, 코스 데이터, API 키 확인
-   **데이터 최적화**: 코스 데이터 간소화로 API 효율성 증대
-   **응답 파싱**: JSON 코드 블록 추출 및 파싱
-   **에러 처리**: API 키, 할당량, 네트워크 오류별 처리

### 2. courseRecommendationPrompt.js

```javascript
// 핵심 기능: 구조화된 AI 프롬프트 생성
export const generateCourseRecommendationPrompt = (selectedTags, courseData);
```

-   **역할 정의**: AI를 러닝 코스 추천 전문가로 설정
-   **응답 형식**: JSON 스키마 강제로 일관된 응답 보장
-   **태그 설명**: 26개 태그별 상세 설명 매핑

### 3. TagSelector.jsx

-   **태그 분류**: 6개 카테고리별 태그 그룹화
-   **선택 제한**: 시간 관련 태그 단일 선택 로직
-   **실시간 연동**: 태그 변경 시 추천 결과 초기화

### 4. RecommendationCard.jsx

-   **지도 통합**: KakaoMap 컴포넌트로 경로 시각화
-   **AI 표시**: 명확한 AI 추천 배지
-   **매칭 정보**: 선택 태그와 매칭된 태그 하이라이팅

## 환경 설정

### 필수 환경 변수

```env
REACT_APP_GEMINI_API_KEY=your_gemini_api_key
REACT_APP_SUPABASE_URL=your_supabase_url
REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
```

### API 설정

1. **Google AI Studio**에서 Gemini API 키 발급
2. **Supabase** 프로젝트 생성 및 PostgreSQL 설정
3. **Kakao Developers**에서 지도 API 키 발급

## 추천 알고리즘

### 1. 태그 매칭 방식

-   사용자 선택 태그와 코스 태그 간 교집합 분석
-   태그별 가중치 적용 (시간, 강도, 풍경 등 카테고리별 차등)
-   매칭도 점수 (1-100) 산출

### 2. AI 프롬프트 전략

```
역할: 러닝 코스 추천 전문가
입력: 선택 태그 + 코스 데이터
출력: JSON 형태 3개 추천 (courseId, reason, matchScore, matchedTags)
제약: 실제 코스 데이터만 사용, 한 문장 이유 설명
```

### 3. 응답 검증

-   JSON 스키마 검증
-   코스 ID 존재 확인
-   추천 개수 (3개) 검증
-   매칭 점수 범위 확인

## 성능 최적화

### 1. API 효율성

-   코스 데이터 간소화 (id, title, tags만 전송)
-   프롬프트 길이 최적화
-   JSON 응답 강제로 파싱 안정성 확보

### 2. 사용자 경험

-   로딩 상태 표시
-   에러 타입별 친화적 메시지
-   추천 결과 캐싱 (태그 변경 시까지)

### 3. 컴포넌트 최적화

-   지도 컴포넌트 리렌더링 최소화
-   태그 색상 캐싱
-   불필요한 API 호출 방지

## 에러 처리 전략

### 1. API 에러

-   **API 키 오류**: 환경변수 확인 메시지
-   **할당량 초과**: 사용량 한도 안내
-   **네트워크 오류**: 연결 상태 확인 요청

### 2. 데이터 에러

-   **JSON 파싱 실패**: 원본 응답 로깅 및 재시도 안내
-   **코스 데이터 부재**: 데이터베이스 연결 확인
-   **매칭 실패**: 대체 추천 로직 실행

### 3. 사용자 에러

-   **태그 미선택**: 선택 요청 메시지
-   **응답 시간 초과**: 재시도 버튼 제공

## 보안 고려사항

### 1. API 키 관리

-   환경변수를 통한 키 관리
-   클라이언트 사이드 노출 (REACT*APP* 접두어)
-   프로덕션 환경에서 서버 사이드 프록시 권장

### 2. 데이터 검증

-   사용자 입력 태그 화이트리스트 검증
-   AI 응답 스키마 검증
-   SQL 인젝션 방지 (Supabase ORM 사용)
