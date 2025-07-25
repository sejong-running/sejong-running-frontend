# KakaoMap 컴포넌트 리팩터링 문제 해결 과정

## 문제 상황

### 1. 기존 문제점
- `CourseDetailModal.jsx`에서 `geoJsonData` prop을 사용하고 있었음
- `KakaoMap.jsx` 컴포넌트에서는 `geomJson` prop을 지원하도록 리팩터링되었음
- prop 이름 불일치로 인해 런타임 에러 발생:
  ```
  KakaoMap.jsx:274 Uncaught ReferenceError: isLoading is not defined
  ```

### 2. 에러의 근본 원인
- 리팩터링 과정에서 `isLoading` 상태를 제거했지만 JSX에서 여전히 참조하고 있었음
- 서로 다른 파일에서 일관되지 않은 prop 이름 사용

## 해결 과정

### 1단계: 코드 파악
```bash
# 카카오맵 관련 파일 검색
find . -name "*map*" -type f
grep -r "kakao\|Kakao" --include="*.jsx" src/
```

### 2단계: KakaoMap 컴포넌트 리팩터링
- **단일 경로 지원**: `geomJson` prop 추가
- **다중 경로 지원**: 기존 `courses` 배열 방식 유지
- **명확한 인터페이스**: `center`, `bounds`, `level` 등 직관적인 props

```jsx
// 기존 (다중 경로만 지원)
const KakaoMap = ({
    courses = [],
    selectedCourseId = null,
    // ...
}) => {

// 리팩터링 후 (단일/다중 경로 모두 지원)
const KakaoMap = ({
    geomJson = null,      // 단일 경로용
    courses = [],         // 다중 경로용
    selectedCourseId = null,
    center = null,        // 중심 좌표
    bounds = null,        // 바운드
    // ...
}) => {
```

### 3단계: 로직 분리 및 최적화
```jsx
// 경로 데이터 변경 시 Polyline 그리기
useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // 기존 Polyline 모두 제거
    polylinesRef.current.forEach((poly) => poly.setMap(null));
    polylinesRef.current = [];

    // 단일 경로 데이터 처리
    if (geomJson) {
        drawSingleRoute(geomJson);
    }
    // 다중 경로 데이터 처리
    else if (courses && courses.length > 0) {
        drawMultipleRoutes();
    }
}, [geomJson, courses, selectedCourseId, routeStyle, highlightStyle, center, bounds]);
```

### 4단계: 함수 분리
- `drawSingleRoute()`: 단일 경로 그리기
- `drawMultipleRoutes()`: 다중 경로 그리기  
- `setMapViewForSingleRoute()`: 단일 경로용 지도 뷰 설정
- `setMapViewForMultipleRoutes()`: 다중 경로용 지도 뷰 설정

### 5단계: 사용하지 않는 코드 정리
```jsx
// 제거된 코드
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// JSX에서도 제거
{isLoading && (
    <div className="loading-overlay">
        <div className="loading-spinner">경로 데이터 로딩 중...</div>
    </div>
)}
```

### 6단계: Props 이름 통일
```jsx
// CourseDetailModal.jsx 수정 전
<KakaoMap geoJsonData={getGeoJsonData()} />

// 수정 후
<KakaoMap geomJson={getGeoJsonData()} />
```

## 최종 결과

### 개선된 사용법

#### 1. 단일 경로 표시
```jsx
<KakaoMap 
    geomJson={course.geomJson}
    center={{lat: 36.5, lng: 127.3}}
    bounds={{minLat: 36.4, maxLat: 36.6, minLng: 127.2, maxLng: 127.4}}
    level={6}
    controllable={false}
    routeStyle={{
        strokeWeight: 5,
        strokeColor: "#FF6B6B",
        strokeOpacity: 0.8,
        strokeStyle: "solid"
    }}
/>
```

#### 2. 다중 경로 표시
```jsx
<KakaoMap 
    courses={[
        {id: 1, geomJson: course1.geomJson},
        {id: 2, geomJson: course2.geomJson}
    ]}
    selectedCourseId={1}
    routeStyle={{strokeColor: "#7C4DFF", strokeOpacity: 0.2}}
    highlightStyle={{strokeColor: "#7C4DFF", strokeOpacity: 1}}
/>
```

### 주요 개선사항
- ✅ **간편한 사용**: `geomJson`만 전달하면 바로 경로 표시
- ✅ **하위 호환성**: 기존 `courses` 방식도 계속 지원
- ✅ **명확한 인터페이스**: `center`, `bounds`, `level` 등 직관적인 props
- ✅ **코드 정리**: 불필요한 상태와 JSX 제거
- ✅ **일관성**: 모든 파일에서 동일한 prop 이름 사용

## 교훈

1. **리팩터링 시 철저한 의존성 검사**: 변경된 컴포넌트를 사용하는 모든 파일 확인 필요
2. **단계적 접근**: 큰 변경사항을 작은 단위로 나누어 진행
3. **인터페이스 일관성**: 같은 데이터에 대해 일관된 prop 이름 사용
4. **불필요한 코드 정리**: 사용하지 않는 상태나 JSX는 즉시 제거
5. **빌드 테스트**: 각 단계마다 빌드 테스트로 문제 조기 발견