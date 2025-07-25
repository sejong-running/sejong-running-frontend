import React, { useState, useEffect } from "react";
import "./MainPage.css";
import Header from "../components/shared/Header";
import KakaoMap from "../components/map/KakaoMap";
import CourseList from "../components/mainpage/CourseList";
import { getAllCourses } from "../services";

const MainPage = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

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

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        console.log("선택된 코스:", course);
    };

    return (
        <div className="main-page-container">
            <Header />
            <div className="main-page">
                <div className="main-content">
                    <KakaoMap
                        width="100%"
                        height="100%"
                        geoJsonData={selectedCourse?.geomJson}
                        center={selectedCourse ? {
                            lat: (selectedCourse.minLatitude + selectedCourse.maxLatitude) / 2,
                            lng: (selectedCourse.minLongitude + selectedCourse.maxLongitude) / 2
                        } : null}
                        bounds={selectedCourse ? {
                            minLat: selectedCourse.minLatitude,
                            maxLat: selectedCourse.maxLatitude,
                            minLng: selectedCourse.minLongitude,
                            maxLng: selectedCourse.maxLongitude
                        } : null}
                        controllable={true}
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
