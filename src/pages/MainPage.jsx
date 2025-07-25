import React, { useState, useEffect } from "react";
import "./MainPage.css";
import Header from "../components/shared/Header";
import KakaoMap from "../components/map/KakaoMap";
import CourseList from "../components/mainpage/CourseList";
import { getAllCourses } from "../api/courses";
import { getGpxFileUrl } from "../utils/gpxStorage";

const MainPage = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [currentGpxUrl, setCurrentGpxUrl] = useState(null);

    useEffect(() => {
        const fetchCourses = async () => {
            try {
                setLoading(true);
                const { data, error } = await getAllCourses();
                if (error) {
                    setError(error);
                } else {
                    setCourses(data);
                }
            } catch (err) {
                setError("코스 데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchCourses();
    }, []);

    const handleCourseSelect = async (course) => {
        setSelectedCourse(course);
        console.log("선택된 코스:", course);

        // GeoJSON 데이터가 있으면 우선 사용, 없으면 GPX 파일 사용 (하위 호환성)
        if (course.geomJson) {
            console.log("GeoJSON 데이터 사용:", course.geomJson);
            setCurrentGpxUrl(null); // GPX URL 초기화
        } else if (course.gpxFilePath) {
            const { url, error } = await getGpxFileUrl(course.gpxFilePath);
            if (url && !error) {
                setCurrentGpxUrl(url);
                console.log("GPX URL 생성 성공:", url);
            } else {
                console.error("GPX URL 생성 실패:", error);
            }
        }
    };

    return (
        <div className="main-page-container">
            <Header />
            <div className="main-page">
                <div className="main-content">
                    <KakaoMap
                        width="100%"
                        height="100%"
                        gpxUrl={currentGpxUrl}
                        geoJsonData={selectedCourse?.geomJson}
                        center={selectedCourse ? {
                            lat: (selectedCourse.startLatitude + (selectedCourse.endLatitude || selectedCourse.startLatitude)) / 2,
                            lng: (selectedCourse.startLongitude + (selectedCourse.endLongitude || selectedCourse.startLongitude)) / 2
                        } : null}
                        bounds={selectedCourse ? {
                            minLat: Math.min(selectedCourse.startLatitude, selectedCourse.endLatitude || selectedCourse.startLatitude),
                            maxLat: Math.max(selectedCourse.startLatitude, selectedCourse.endLatitude || selectedCourse.startLatitude),
                            minLng: Math.min(selectedCourse.startLongitude, selectedCourse.endLongitude || selectedCourse.startLongitude),
                            maxLng: Math.max(selectedCourse.startLongitude, selectedCourse.endLongitude || selectedCourse.startLongitude)
                        } : null}
                        controllable={true}
                        autoFitBounds={false}
                        fitBoundsOnChange={false}
                        boundsPadding={100}
                        onMapLoad={(map) => console.log("맵 로드 완료:", map)}
                    />
                </div>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h2>러닝 코스</h2>
                        <span className="course-count">
                            {loading
                                ? "로딩 중..."
                                : `${courses.length}개 코스`}
                        </span>
                    </div>
                    {loading ? (
                        <div className="loading-state">
                            <p>코스 정보를 불러오고 있습니다...</p>
                        </div>
                    ) : error ? (
                        <div className="error-state">
                            <p>오류: {error}</p>
                            <button onClick={() => window.location.reload()}>
                                다시 시도
                            </button>
                        </div>
                    ) : (
                        <CourseList
                            courses={courses}
                            onCourseSelect={handleCourseSelect}
                            selectedCourse={selectedCourse}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default MainPage;
