# KakaoMap 컴포넌트 리팩터링 가이드

## 리팩터링 배경

**목표**: 경로 정보를 인자로 전달하면 바로 표시되는 직관적인 카카오맵 컴포넌트 구현

## 기존 문제점 vs 개선 사항

### 1. 🎯 사용 복잡성 문제

#### ❌ 기존: 단일 경로도 복잡한 구조 필요
```jsx
// RunningCard에서 단일 경로 표시
<KakaoMap 
    courses={[{id: course.id, geomJson: course.geomJson}]}  // 배열로 감싸야 함
    selectedCourseId={course.id}                            // 불필요한 ID 설정
    bounds={calculateBoundsFromCourse(course)}              // 복잡한 계산 로직
    center={calculateCenterFromCourse(course)}              // 복잡한 계산 로직
    level={6}
    controllable={false}
    routeStyle={{strokeColor: "#FF6B6B"}}
/>
```

**문제점:**
- 단일 경로인데도 배열 구조 강요
- 불필요한 `selectedCourseId` 설정 필요
- 매번 bounds, center 계산 로직 작성 필요
- 직관적이지 않은 API

#### ✅ 개선: 단일 경로는 간단하게
```jsx
// RunningCard에서 단일 경로 표시
<KakaoMap 
    geomJson={course.geomJson}                    // 바로 데이터 전달
    bounds={course.bounds}                        // 미리 계산된 값 사용
    controllable={false}
    routeStyle={{strokeColor: "#FF6B6B"}}
/>
```

**개선점:**
- 직관적인 단일 데이터 전달
- 불필요한 배열 래핑 제거
- ID 설정 불필요
- 간결하고 명확한 API

### 2. 🔧 지도 설정의 유연성 문제

#### ❌ 기존: 복잡한 지도 중심/범위 설정
```jsx
// 매번 복잡한 계산이 필요했음
const calculateCenter = (course) => {
    if (course.minLatitude && course.maxLatitude) {
        return {
            lat: (course.minLatitude + course.maxLatitude) / 2,
            lng: (course.minLongitude + course.maxLongitude) / 2,
        };
    }
    return null;
};

const calculateBounds = (course) => {
    if (course.minLatitude && course.maxLatitude) {
        return {
            minLat: course.minLatitude,
            maxLat: course.maxLatitude,
            minLng: course.minLongitude,
            maxLng: course.maxLongitude,
        };
    }
    return null;
};

<KakaoMap 
    courses={[course]}
    center={calculateCenter(course)}      // 매번 계산
    bounds={calculateBounds(course)}      // 매번 계산  
/>
```

#### ✅ 개선: 직접적이고 우선순위 기반 설정
```jsx
// 1순위: bounds로 자동 맞춤
<KakaoMap 
    geomJson={course.geomJson}
    bounds={{minLat: 36.4, maxLat: 36.6, minLng: 127.2, maxLng: 127.4}}
/>

// 2순위: center + level로 고정 위치
<KakaoMap 
    geomJson={course.geomJson}
    center={{lat: 36.5, lng: 127.3}}
    level={7}
/>

// 3순위: 자동 범위 조정
<KakaoMap 
    geomJson={course.geomJson}
    fitBoundsOnChange={true}
/>
```

**개선점:**
- 우선순위 기반 자동 설정 (bounds → center → auto)
- 매번 계산 로직 작성 불필요
- 더 직관적인 제어 방식

### 3. 🔄 하위 호환성 문제

#### ❌ 기존: 리팩터링 시 기존 코드 모두 수정 필요
```jsx
// MainPage에서 여러 코스 표시 (기존 방식)
<KakaoMap 
    courses={courseList}
    selectedCourseId={selectedId}
    routeStyle={{strokeOpacity: 0.2}}
    highlightStyle={{strokeOpacity: 1}}
/>
```

만약 기존 방식을 버렸다면 이런 코드들을 모두 수정해야 함

#### ✅ 개선: 기존 방식 완전 호환 + 새로운 방식 추가
```jsx
// 🔄 기존 다중 경로 방식 - 그대로 동작
<KakaoMap 
    courses={courseList}
    selectedCourseId={selectedId}
    routeStyle={{strokeOpacity: 0.2}}
    highlightStyle={{strokeOpacity: 1}}
/>

// 🆕 새로운 단일 경로 방식 - 선택적 사용
<KakaoMap 
    geomJson={singleRoute.geomJson}
    routeStyle={{strokeColor: "#3B82F6"}}
/>
```

**개선점:**
- 기존 코드 수정 없이 그대로 사용 가능
- 새로운 기능은 필요할 때만 사용
- 점진적 마이그레이션 가능

### 4. 📦 코드 구조 문제

#### ❌ 기존: 하나의 복잡한 useEffect
```jsx
// 110줄의 거대한 useEffect 함수
useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    // 기존 Polyline 제거
    polylinesRef.current.forEach((poly) => poly.setMap(null));
    polylinesRef.current = [];
    
    if (!courses || courses.length === 0) return;
    
    let selectedCenter = null;
    let selectedPolyline = null;
    
    // 복잡한 courses 순회 로직
    courses.forEach((course) => {
        // GeoJSON 파싱
        // Polyline 생성
        // 스타일 적용
        // 선택된 코스 처리
        // 중심점 계산
        // ... 50+ 줄의 복잡한 로직
    });
    
    // 선택된 Polyline 앞으로 이동
    // 지도 중심 이동 로직
    // ... 또 30+ 줄
}, [courses, selectedCourseId, routeStyle, highlightStyle]);
```

**문제점:**
- 하나의 함수가 너무 많은 일을 담당
- 가독성 저하
- 디버깅 어려움
- 재사용성 부족

#### ✅ 개선: 목적별 함수 분리
```jsx
// 메인 useEffect - 분기 처리만
useEffect(() => {
    if (!mapInstanceRef.current) return;
    
    polylinesRef.current.forEach(poly => poly.setMap(null));
    polylinesRef.current = [];

    if (geomJson) {
        drawSingleRoute(geomJson);        // 단일 경로 처리
    } else if (courses?.length > 0) {
        drawMultipleRoutes();             // 다중 경로 처리
    }
}, [geomJson, courses, selectedCourseId, routeStyle, highlightStyle]);

// 목적별 분리된 함수들
const drawSingleRoute = (geoJsonData) => {
    // 단일 경로 그리기 로직만 (20줄)
};

const drawMultipleRoutes = () => {
    // 다중 경로 그리기 로직만 (30줄)
};

const setMapViewForSingleRoute = (trackPoints) => {
    // 단일 경로 뷰 설정 로직만 (15줄)
};

const setMapViewForMultipleRoutes = (selectedCenter) => {
    // 다중 경로 뷰 설정 로직만 (20줄)
};
```

**개선점:**
- 단일 책임 원칙 적용
- 가독성 대폭 향상
- 디버깅 및 테스트 용이
- 로직 재사용 가능

### 5. 🧹 코드 품질 문제

#### ❌ 기존: 불필요한 코드와 일관성 문제
```jsx
// 사용하지 않는 상태들
const [isLoading, setIsLoading] = useState(false);
const [error, setError] = useState(null);

// JSX에서 사용하지 않는 상태 참조
{isLoading && <div>로딩중...</div>}
{error && <div>에러: {error}</div>}

// 일관되지 않은 import
import {
    loadGeoJsonFromData,
    calculateBounds,      // 사용 안 함
    calculateCenter,      // 사용 안 함  
} from "../../utils/geoJsonParser";

// 서로 다른 파일에서 다른 prop 이름 사용
// RunningCard.jsx
<KakaoMap geoJsonData={data} />

// CourseDetailModal.jsx  
<KakaoMap geoJsonData={data} />

// KakaoMap.jsx (실제로는 geomJson 기대)
const KakaoMap = ({ geomJson }) => {
```

#### ✅ 개선: 깔끔하고 일관된 코드
```jsx
// 필요한 상태만 유지 (error 상태도 onError 콜백으로 대체)
const mapRef = useRef(null);
const mapInstanceRef = useRef(null);
const polylinesRef = useRef([]);

// 필요한 import만
import {
    loadGeoJSONFromData,
} from "../../utils/geoJsonParser";

// 모든 파일에서 일관된 prop 이름
// RunningCard.jsx
<KakaoMap geomJson={data} />

// CourseDetailModal.jsx
<KakaoMap geomJson={data} />

// KakaoMap.jsx
const KakaoMap = ({ geomJson }) => {
```

**개선점:**
- 불필요한 코드 완전 제거
- 일관된 명명 규칙 적용
- 더 명확한 에러 처리 (콜백 방식)
- 코드 품질 향상

## 최종 결과: 완전히 개선된 사용 경험

### Before vs After 종합 비교

#### ❌ 기존: 복잡하고 일관성 없는 사용법
```jsx
// 1. 단일 경로 표시 - 복잡함
<KakaoMap 
    courses={[{id: course.id, geomJson: course.geomJson}]}
    selectedCourseId={course.id}
    bounds={calculateBoundsFromCourse(course)}
    center={calculateCenterFromCourse(course)}
    level={6}
    controllable={false}
    routeStyle={{strokeColor: "#FF6B6B"}}
/>

// 2. 다중 경로 표시 - 110줄의 복잡한 useEffect
// 3. prop 이름 불일치 - geoJsonData vs geomJson  
// 4. 불필요한 코드 - isLoading, error 상태
// 5. 복잡한 계산 로직 - 매번 center, bounds 계산
```

#### ✅ 개선: 간단하고 직관적인 사용법  
```jsx
// 1. 단일 경로 표시 - 간단함
<KakaoMap 
    geomJson={course.geomJson}
    bounds={course.bounds}
    controllable={false}
    routeStyle={{strokeColor: "#FF6B6B"}}
/>

// 2. 다중 경로 표시 - 기존 방식 그대로 지원
<KakaoMap 
    courses={courseList} 
    selectedCourseId={activeId}
/>

// 3. 일관된 prop 이름 - 모든 곳에서 geomJson
// 4. 깔끔한 코드 - 필요한 것만 유지
// 5. 우선순위 기반 자동 설정 - bounds → center → auto
```

## 핵심 성과

### 1. 🎯 개발자 경험 향상
- **개발 시간 단축**: 복잡한 설정 코드 작성 불필요
- **인지 부하 감소**: 직관적인 API 사용
- **실수 방지**: 일관된 prop 이름으로 오타 방지

### 2. 🔧 유지보수성 개선  
- **코드 가독성**: 목적별 함수 분리로 이해하기 쉬움
- **디버깅 용이**: 각 기능별로 독립적인 함수
- **테스트 가능**: 분리된 함수들의 단위 테스트 가능

### 3. 🔄 확장성 확보
- **하위 호환성**: 기존 코드 수정 없이 그대로 사용
- **점진적 업그레이드**: 필요한 부분만 새 방식 적용
- **미래 확장**: 새로운 기능 추가 시 기존 구조 활용 가능

### 4. 📦 코드 품질 향상
- **불필요한 코드 제거**: 사용하지 않는 상태/import 정리
- **일관성 확보**: 프로젝트 전체에서 동일한 네이밍
- **성능 최적화**: 효율적인 렌더링 로직

## 사용 가이드

### 📍 단일 경로 표시 (새로운 권장 방식)
```jsx
// 가장 간단한 사용법
<KakaoMap geomJson={route.geomJson} />

// bounds로 정확한 범위 지정
<KakaoMap 
    geomJson={route.geomJson}
    bounds={{minLat: 36.4, maxLat: 36.6, minLng: 127.2, maxLng: 127.4}}
/>

// center로 고정 위치 지정
<KakaoMap 
    geomJson={route.geomJson}
    center={{lat: 36.5, lng: 127.3}}
    level={7}
/>

// 스타일 커스터마이징
<KakaoMap 
    geomJson={route.geomJson}
    bounds={route.bounds}
    controllable={false}
    routeStyle={{
        strokeWeight: 5,
        strokeColor: "#3B82F6",
        strokeOpacity: 0.85
    }}
/>
```

### 🗺️ 다중 경로 표시 (기존 방식 유지)
```jsx
// 기존 코드 그대로 사용 가능
<KakaoMap 
    courses={courseList}
    selectedCourseId={activeId}
    routeStyle={{strokeOpacity: 0.3}}
    highlightStyle={{strokeOpacity: 1}}
    defaultCenter={{lat: 36.5, lng: 127.3}}
/>
```

## 마이그레이션 가이드

### 단계별 업그레이드 방법

1. **기존 코드 유지**: 현재 사용 중인 `courses` 방식은 그대로 두기
2. **새로운 컴포넌트부터 적용**: 새로 만드는 부분만 `geomJson` 방식 사용  
3. **점진적 교체**: 필요에 따라 기존 코드를 새 방식으로 교체

### 교체 예시
```jsx
// Before (교체 전)
<KakaoMap 
    courses={[{id: 1, geomJson: singleRoute}]}
    selectedCourseId={1}
    bounds={calculateBounds(singleRoute)}
/>

// After (교체 후)  
<KakaoMap 
    geomJson={singleRoute}
    bounds={routeBounds}
/>
```

**결과**: KakaoMap은 이제 **"경로 정보만 넘기면 바로 표시되는"** 진정으로 직관적인 컴포넌트가 되었습니다! 🎉