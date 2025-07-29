# 세종 러닝 (Sejong Running) - PRD (Product Requirements Document)

## 🎯 제품 개요

### 제품명
**세종 러닝 (Sejong Running)**

### 제품 비전
세종시 전용 러닝 플랫폼으로, 시민들이 세종시의 아름다운 환경 속에서 안전하고 즐거운 러닝 경험을 할 수 있도록 지원하는 웹 애플리케이션

### 핵심 가치 제안 (Value Proposition)
- **지역 특화**: 세종시 환경에 최적화된 러닝 코스 정보 제공
- **개인화**: 사용자 선호도 기반 AI 코스 추천
- **커뮤니티**: 지역 러너들 간의 소통과 정보 공유
- **기록 관리**: 체계적인 개인 러닝 데이터 분석 및 관리

### 배포 URL
https://sejongrun.vercel.app/

---

## 📊 시장 분석 및 목표

### 타겟 사용자
1. **주요 타겟 (Primary)**
   - 세종시 거주 20-40대 러닝 애호가
   - 건강한 라이프스타일을 추구하는 직장인
   - 새로운 러닝 코스를 탐색하고 싶은 기존 러너

2. **부차 타겟 (Secondary)**
   - 세종시 방문 관광객 중 러닝에 관심 있는 사람
   - 러닝을 시작하려는 초보자
   - 지역 러닝 동호회 구성원

### 해결하려는 문제
- 세종시 내 다양한 러닝 코스 정보의 부족
- 개인 선호도에 맞는 코스 찾기의 어려움
- 체계적인 러닝 기록 관리 도구의 부재
- 지역 러너들 간의 정보 공유 플랫폼 부족

---

## 🏗️ 기술 아키텍처

### 프론트엔드 스택
- **React 19.1.0**: 최신 리액트 기능 활용
- **React Router DOM 7.7.0**: SPA 라우팅
- **CSS3**: 모던 스타일링 (그라디언트, 애니메이션)
- **카카오맵 API**: 정확한 지도 및 위치 서비스

### 백엔드 & 인프라
- **Supabase**: 
  - PostgreSQL + PostGIS (지리공간 데이터)
  - 실시간 데이터베이스
  - 사용자 인증
  - 파일 스토리지
- **Vercel**: 프론트엔드 배포 및 호스팅

### 외부 API
- **Google Gemini AI**: 개인화된 코스 추천
- **카카오맵 API**: 지도 서비스 및 경로 표시
- **PostGIS**: 지리공간 데이터 처리

### 데이터 처리
- **Fast XML Parser**: GPX 파일 파싱
- **GeoJSON**: 코스 경로 데이터 표준화

---

## 🎨 주요 기능 명세

### 1. 홈페이지 (Landing Page)
**목적**: 사용자 온보딩 및 서비스 소개

**핵심 기능**:
- 세종시 대표 러닝 코스 갤러리 (이미지 슬라이더)
- 서비스 주요 기능 소개 카드
- 직관적인 CTA 버튼 ("코스 둘러보기")

**주요 컴포넌트**:
- `HomePage.jsx`: 메인 랜딩 페이지
- 반응형 이미지 슬라이더
- 플로팅 애니메이션 효과

### 2. 코스 탐색 페이지 (MainPage)
**목적**: 사용자가 원하는 조건에 맞는 러닝 코스 탐색

**핵심 기능**:
- **실시간 지도**: 카카오맵 기반 코스 경로 시각화
- **고급 필터링**:
  - 거리별 슬라이더 필터 (0-20km)
  - 코스 유형별 다중 선택 (공원, 트레일, 도시 등)
  - 정렬 옵션 (인기순, 최신순, 거리순)
- **검색 기능**: 코스명, 설명, 태그 기반 검색
- **사이드바 코스 리스트**: 접이식 사이드바로 공간 효율성
- **코스 상세 모달**: 클릭 시 상세 정보 팝업

**주요 컴포넌트**:
- `MainPage.jsx`: 메인 코스 탐색 페이지
- `KakaoMap.jsx`: 지도 컴포넌트
- `CourseFilter.jsx`: 필터링 컴포넌트
- `MainPageCourseList.jsx`: 코스 목록 컴포넌트
- `CourseDetailModal.jsx`: 코스 상세 모달

**데이터 흐름**:
```
사용자 입력 → 필터 상태 업데이트 → 코스 데이터 필터링 → 지도 + 리스트 동기화
```

### 3. AI 추천 페이지 (RecommendPage)
**목적**: 개인화된 코스 추천을 통한 사용자 경험 향상

**핵심 기능**:
- **태그 기반 선호도 입력**: 러닝 목적, 난이도, 환경 선택
- **Gemini AI 추천**: 선택된 태그 기반 맞춤형 코스 추천
- **추천 결과 시각화**: 매칭 점수, 추천 이유와 함께 표시
- **폴백 시스템**: AI 오류 시 랜덤 추천 제공

**주요 컴포넌트**:
- `RecommendPage.jsx`: 추천 페이지
- `TagSelector.jsx`: 태그 선택 컴포넌트
- `RecommendationCard.jsx`: 추천 결과 카드

**AI 추천 로직**:
```
사용자 태그 선택 → Gemini API 호출 → JSON 응답 파싱 → 코스 데이터 매칭 → 결과 표시
```

### 4. 마이페이지 (MyPage)
**목적**: 개인 러닝 데이터 관리 및 분석

**핵심 기능**:
- **러닝 통계 대시보드**:
  - 총 러닝 횟수
  - 총 누적 거리
  - 최고 페이스 기록
  - 즐겨찾기 코스 수
- **탭 기반 콘텐츠**:
  - **러닝 기록**: 개인 러닝 히스토리 (거리, 시간, 페이스)
  - **좋아요**: 즐겨찾기한 코스 목록
- **개인 기록 관리**: 각 러닝의 상세 분석 데이터

**주요 컴포넌트**:
- `MyPage.jsx`: 마이페이지
- `RunningStats.jsx`: 통계 대시보드
- `Tabs.jsx`: 탭 네비게이션
- `MyRunningHistoryCard.jsx`: 러닝 기록 카드
- `MyPageCourseCard.jsx`: 좋아요 코스 카드

### 5. 관리자 페이지 (AdminPage)
**목적**: 시스템 관리 및 콘텐츠 관리

**핵심 기능**:
- 코스 데이터 CRUD 관리
- 사용자 통계 모니터링
- 시스템 상태 확인

---

## 🗄️ 데이터베이스 스키마

### 주요 테이블 구조

#### 1. users (사용자)
```sql
- id: SERIAL PRIMARY KEY
- username: VARCHAR(50) UNIQUE NOT NULL
- email: VARCHAR(100) UNIQUE NOT NULL
```

#### 2. courses (코스)
```sql
- id: SERIAL PRIMARY KEY
- title: VARCHAR(200) NOT NULL
- description: TEXT
- distance: DECIMAL(8,2)
- gpx_file_path: VARCHAR(500)
- geom: GEOMETRY(LINESTRING, 4326)
- min_latitude, max_latitude: DECIMAL(10,8)
- min_longitude, max_longitude: DECIMAL(11,8)
- created_by: INTEGER REFERENCES users(id)
- created_time: TIMESTAMP DEFAULT NOW()
- likes_count: INTEGER DEFAULT 0
```

#### 3. types (코스 유형)
```sql
- id: SERIAL PRIMARY KEY
- name: VARCHAR(50) NOT NULL
- category: VARCHAR(50)
```

#### 4. course_types (코스-유형 연결)
```sql
- course_id: INTEGER REFERENCES courses(id)
- type_id: INTEGER REFERENCES types(id)
- PRIMARY KEY (course_id, type_id)
```

#### 5. course_likes (좋아요)
```sql
- user_id: INTEGER REFERENCES users(id)
- course_id: INTEGER REFERENCES courses(id)
- created_time: TIMESTAMP DEFAULT NOW()
- PRIMARY KEY (user_id, course_id)
```

#### 6. run_records (러닝 기록)
```sql
- id: SERIAL PRIMARY KEY
- user_id: INTEGER REFERENCES users(id)
- course_id: INTEGER REFERENCES courses(id)
- actual_distance_km: DECIMAL(8,2)
- actual_duration_sec: DECIMAL(8,2)
- actual_pace: DECIMAL(8,2)
- personal_best: BOOLEAN DEFAULT FALSE
- created_time: TIMESTAMP DEFAULT NOW()
```

#### 7. user_stats (사용자 통계)
```sql
- user_id: INTEGER PRIMARY KEY REFERENCES users(id)
- total_runs: INTEGER DEFAULT 0
- total_distance_km: DECIMAL(10,2) DEFAULT 0
- best_pace: DECIMAL(8,2)
- updated_at: TIMESTAMP DEFAULT NOW()
```

---

## 🔄 주요 사용자 플로우

### 1. 신규 사용자 플로우
```
홈페이지 방문 → 서비스 소개 확인 → "코스 둘러보기" 클릭 → 
코스 탐색 페이지 → 관심 코스 확인 → 상세 정보 모달 → 
(선택적) 추천 페이지 → 마이페이지 가입
```

### 2. 코스 탐색 플로우
```
코스 탐색 페이지 → 필터 설정 (거리, 유형, 정렬) → 
지도에서 코스 확인 → 코스 클릭 → 상세 모달 → 
좋아요 또는 지도에서 보기
```

### 3. AI 추천 플로우
```
추천 페이지 → 선호 태그 선택 → "추천받기" 클릭 → 
AI 처리 (로딩) → 추천 결과 3개 표시 → 코스 선택 → 상세 모달
```

### 4. 개인 기록 관리 플로우
```
마이페이지 → 통계 확인 → 탭 선택 (기록/좋아요) → 
상세 데이터 확인 → 개별 기록 클릭 → 상세 분석
```

---

## 🎨 UI/UX 디자인 가이드라인

### 디자인 철학
- **미니멀리즘**: 깔끔하고 직관적인 인터페이스
- **지역성**: 세종시의 자연환경을 반영한 그린 컬러 팔레트
- **접근성**: 모든 사용자가 쉽게 사용할 수 있는 유니버설 디자인

### 색상 체계
- **Primary**: 자연 그린 계열 (#4CAF50, #66BB6A)
- **Secondary**: 세종시 블루 계열 (#2196F3, #42A5F5)
- **Accent**: 러닝 에너지를 상징하는 오렌지 (#FF9800)
- **Neutral**: 그레이 계열 (#F5F5F5, #E0E0E0, #757575)

### 반응형 디자인
- **모바일 우선**: 스마트폰 사용자를 위한 최적화
- **태블릿 대응**: 중간 화면 크기 효율적 활용
- **데스크톱 최적화**: 넓은 화면에서의 정보 밀도 향상

---

## 🔧 기술적 특징

### 1. 지리공간 데이터 처리
- **PostGIS 활용**: 효율적인 공간 쿼리 및 분석
- **GPX → GeoJSON 변환**: 표준화된 경로 데이터 처리
- **실시간 지도 렌더링**: 카카오맵 API 최적화

### 2. 성능 최적화
- **React.memo**: 컴포넌트 리렌더링 최적화
- **useMemo/useCallback**: 계산 결과 캐싱
- **지연 로딩**: 필요시에만 컴포넌트 로드

### 3. AI 통합
- **Google Gemini API**: 자연어 기반 추천 시스템
- **프롬프트 엔지니어링**: 정확한 추천을 위한 구조화된 프롬프트
- **폴백 시스템**: AI 실패 시 대안 추천 제공

### 4. 실시간 데이터 동기화
- **Supabase Realtime**: 좋아요, 통계 즉시 반영
- **낙관적 업데이트**: 사용자 경험 향상을 위한 즉시 UI 반영

---

## 📈 성공 지표 (KPI)

### 1. 사용자 참여도
- **DAU (Daily Active Users)**: 일일 활성 사용자 수
- **세션 시간**: 평균 사용 세션 길이
- **페이지 뷰**: 페이지별 조회수

### 2. 기능 활용도
- **코스 탐색**: 필터 사용률, 코스 클릭률
- **AI 추천**: 추천 요청 횟수, 추천 코스 선택률
- **좋아요**: 코스별 좋아요 수, 사용자별 좋아요 활동

### 3. 콘텐츠 품질
- **코스 다양성**: 등록된 코스 수, 태그 분포
- **사용자 만족도**: 리뷰, 재방문률

---

## 🚀 로드맵

### Phase 1 (현재): 기본 기능 구현 ✅
- [x] 코스 탐색 및 필터링
- [x] AI 기반 추천 시스템
- [x] 개인 기록 관리
- [x] 반응형 웹 디자인

### Phase 2 (향후 3개월): 고도화
- [ ] **PWA 지원**: 오프라인 모드, 앱 설치
- [ ] **소셜 기능**: 친구 추가, 그룹 러닝
- [ ] **실시간 GPS 추적**: 실제 러닝 중 경로 기록
- [ ] **날씨 연동**: 날씨 정보 기반 코스 추천

### Phase 3 (향후 6개월): 커뮤니티
- [ ] **러닝 챌린지**: 월간/주간 도전 과제
- [ ] **리더보드**: 사용자 간 순위 시스템
- [ ] **리뷰 시스템**: 코스별 사용자 리뷰
- [ ] **이벤트 관리**: 지역 러닝 이벤트 정보

### Phase 4 (향후 1년): 확장
- [ ] **다른 지역 확장**: 대전, 충남 지역
- [ ] **모바일 앱**: React Native 기반
- [ ] **웨어러블 연동**: 스마트워치 데이터 연동
- [ ] **헬스케어 통합**: 건강 데이터 분석

---

## 🔒 보안 및 개인정보 보호

### 데이터 보안
- **Supabase 인증**: Row Level Security (RLS) 적용
- **환경변수 관리**: API 키 및 민감 정보 암호화
- **HTTPS 통신**: 모든 데이터 전송 암호화

### 개인정보 처리
- **최소 수집 원칙**: 필수 정보만 수집
- **사용자 동의**: 명시적 개인정보 이용 동의
- **데이터 삭제권**: 사용자 요청 시 계정 및 데이터 완전 삭제

---

## 📞 지원 및 피드백

### 사용자 지원
- **GitHub Issues**: 버그 리포트 및 기능 요청
- **이메일 지원**: 일반 문의사항
- **FAQ**: 자주 묻는 질문 페이지

### 개발자 정보
- **Repository**: GitHub 공개 저장소
- **기술 스택**: React, Supabase, PostGIS
- **라이선스**: MIT License

---

*이 문서는 세종 러닝 프로젝트의 전체적인 기획 및 기술 요구사항을 정의합니다. 지속적인 업데이트를 통해 제품 발전 방향을 명확히 하고, 개발팀과 이해관계자 간의 효율적인 소통을 지원합니다.*