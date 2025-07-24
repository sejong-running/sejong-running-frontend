# Sejong Running 프론트엔드 지도/GPX 버벅임 및 잔상 문제 해결 보고서

---

## 1. 문제 현상 요약

- 코스(GPX) 선택 시 지도와 경로(Polyline)가 정상적으로 표시되지 않거나, 여러 번 코스를 선택하면 웹사이트가 버벅거리거나 먹통이 됨
- 지도 확대/축소 시 경로 또는 지도 타일의 잔상이 남음
- 콘솔에 "맵 로드 완료" 로그가 여러 번 반복 출력됨

---

## 2. 주요 원인 분석

### 2.1 GPX 파싱 및 렌더링 병목
- 기존: GPX 파일 파싱이 메인 스레드(DOMParser)에서 동기적으로 처리되어, 대용량 GPX 파일일 경우 UI가 멈추거나 버벅임 발생

### 2.2 Polyline(경로) 중복 생성/제거 미흡
- 기존: 코스 선택/지도 이벤트(tilesloaded 등)마다 Polyline이 중복 생성되어 여러 Polyline이 지도에 남아 잔상/메모리 누수/성능 저하

### 2.3 카카오맵 인스턴스/컨테이너 정리 미흡
- 기존: 맵 언마운트/재생성 시 mapRef.current의 innerHTML을 비우지 않아 지도 타일/배경 잔상이 남음

### 2.4 useEffect 의존성 과다 및 StrictMode 영향
- 기존: KakaoMap의 useEffect가 너무 많은 값(trackPoints 등)에 의존하여 맵 인스턴스가 불필요하게 여러 번 생성됨
- 개발 환경(StrictMode)에서는 useEffect가 2번씩 실행되어 로그가 중복

---

## 3. 개선 내역

### 3.1 GPX 파싱 Web Worker 적용
- GPX 파싱을 Web Worker에서 처리(fast-xml-parser 사용) → 대용량 GPX 파일도 UI 멈춤 없이 부드럽게 동작

### 3.2 Polyline 관리 구조 개선
- Polyline 인스턴스를 useRef로만 관리, 새 Polyline을 그리기 전에 항상 기존 Polyline을 setMap(null)로 제거
- trackPoints useEffect에서만 Polyline 생성/제거

### 3.3 카카오맵 이벤트 리스너/중복 Polyline 완전 제거
- tilesloaded 등 카카오맵 이벤트에서 Polyline을 그리는 로직 완전 제거 → 확대/축소/이동 시 Polyline 잔상/중복 생성 현상 해결

### 3.4 맵 컨테이너 완전 초기화
- 맵 생성/언마운트 시 mapRef.current.innerHTML = ''로 완전 초기화 → 지도 타일/배경 잔상 현상 해결

### 3.5 useEffect 의존성 최소화
- 맵 인스턴스 생성 useEffect의 의존성 배열을 []로 고정 → 최초 1회만 맵 생성, 이후에는 Polyline만 갱신
- "맵 로드 완료" 로그가 1번만 찍힘(StrictMode 제외)

### 3.6 StrictMode 안내
- 개발 환경에서만 useEffect가 2번 실행되는 것은 StrictMode 때문 → 실제 배포(프로덕션)에서는 한 번만 실행됨

---

## 4. 개선 효과

- 대용량 GPX 파일도 부드럽게 로딩
- 코스/경로 선택 시 잔상/중복/버벅임 현상 완전 해결
- 지도 확대/축소/이동 시에도 항상 하나의 경로와 하나의 지도만 표시
- 메모리/리소스 누수 없이 안정적으로 동작
- 개발 환경에서만 로그가 2번 찍히는 것은 StrictMode 때문(실제 서비스에는 영향 없음)

---

## 5. 결론

- 문제의 핵심은 비동기 파싱, Polyline/맵 인스턴스/컨테이너의 중복 관리, useEffect 의존성 과다에 있었음
- 구조적 개선을 통해 모든 버벅임/잔상/중복 현상을 해결하였음
- 향후에도 비슷한 문제 발생 시, 비동기 처리/컴포넌트 라이프사이클/이벤트 리스너/DOM 정리 등을 우선 점검할 것 