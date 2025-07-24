import React, { useState } from "react";
import "./MainPage.css";
import Header from "../components/shared/Header";
import KakaoMap from "../components/map/KakaoMap";
import CourseList from "../components/mainpage/CourseList";
import { featuredCourses } from "../data/courses";

const MainPage = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);

    const handleCourseSelect = (course) => {
        setSelectedCourse(course);
        // 여기에 지도에 해당 코스 표시 로직 추가 가능
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
                        gpxUrl="/gpx/route_0.gpx"
                        controllable={true}
                        autoFitBounds={true}
                        boundsPadding={100}
                        onMapLoad={(map) => console.log("맵 로드 완료:", map)}
                    />
                </div>
                <div className="sidebar">
                    <div className="sidebar-header">
                        <h2>러닝 코스</h2>
                        <span className="course-count">
                            {featuredCourses.length}개 코스
                        </span>
                    </div>
                    <CourseList
                        courses={featuredCourses}
                        onCourseSelect={handleCourseSelect}
                        selectedCourse={selectedCourse}
                    />
                </div>
            </div>
        </div>
    );
};

export default MainPage;
