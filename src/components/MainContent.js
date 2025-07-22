import React, { useState } from "react";
import "./MainContent.css";
import KakaoMap from "./KakaoMap";

const MainContent = ({ selectedCourse, onCourseSelect }) => {
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"

    const featuredCourses = [
        {
            id: 1,
            name: "세종호수공원 러닝코스",
            distance: "5.2km",
            difficulty: "초급",
            region: "세종시",
            rating: 4.5,
            image: "🏃‍♂️",
            description: "아름다운 호수와 함께하는 편안한 러닝 코스",
            elevation: "평지",
            surface: "포장도로",
        },
        {
            id: 2,
            name: "금강변 트레일",
            distance: "8.7km",
            difficulty: "중급",
            region: "세종시",
            rating: 4.8,
            image: "🌊",
            description: "자연 속에서 즐기는 중급자용 트레일 코스",
            elevation: "구릉지",
            surface: "자갈길",
        },
        {
            id: 3,
            name: "도시공원 순환로",
            distance: "3.1km",
            difficulty: "초급",
            region: "세종시",
            rating: 4.2,
            image: "🌳",
            description: "도시 한가운데에서 즐기는 짧은 러닝 코스",
            elevation: "평지",
            surface: "포장도로",
        },
        {
            id: 4,
            name: "산림욕장 등산로",
            distance: "12.3km",
            difficulty: "고급",
            region: "세종시",
            rating: 4.7,
            image: "🏔️",
            description: "도전적인 산악 러닝을 원하는 고급자용 코스",
            elevation: "산악지",
            surface: "흙길",
        },
    ];

    const handleCourseClick = (course) => {
        onCourseSelect(course);
    };

    return (
        <div className="main-content">
            {/* 히어로 섹션 */}
            <section className="hero-section">
                <div className="hero-content">
                    <h1>세종시 최고의 러닝 코스를 발견하세요</h1>
                    <p>아름다운 자연과 함께하는 러닝 경험을 제공합니다</p>
                    <div className="hero-stats">
                        <div className="stat">
                            <span className="stat-number">50+</span>
                            <span className="stat-label">러닝 코스</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">1,200+</span>
                            <span className="stat-label">러너</span>
                        </div>
                        <div className="stat">
                            <span className="stat-number">4.8</span>
                            <span className="stat-label">평점</span>
                        </div>
                    </div>
                </div>
            </section>

            {/* 뷰 모드 토글 */}
            <div className="view-toggle">
                <button
                    className={`toggle-btn ${
                        viewMode === "grid" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("grid")}
                >
                    📋 목록 보기
                </button>
                <button
                    className={`toggle-btn ${
                        viewMode === "map" ? "active" : ""
                    }`}
                    onClick={() => setViewMode("map")}
                >
                    🗺️ 지도 보기
                </button>
            </div>

            {/* 콘텐츠 영역 */}
            <div className="content-area">
                {viewMode === "grid" ? (
                    <div className="courses-grid">
                        {featuredCourses.map((course) => (
                            <div
                                key={course.id}
                                className="course-card-large"
                                onClick={() => handleCourseClick(course)}
                            >
                                <div className="course-header">
                                    <div className="course-image-large">
                                        {course.image}
                                    </div>
                                    <div className="course-badge">
                                        {course.difficulty}
                                    </div>
                                </div>
                                <div className="course-content">
                                    <h3>{course.name}</h3>
                                    <p className="course-description">
                                        {course.description}
                                    </p>
                                    <div className="course-meta">
                                        <span className="meta-item">
                                            📏 {course.distance}
                                        </span>
                                        <span className="meta-item">
                                            📍 {course.region}
                                        </span>
                                        <span className="meta-item">
                                            ⭐ {course.rating}
                                        </span>
                                    </div>
                                    <div className="course-details">
                                        <span className="detail-item">
                                            고도: {course.elevation}
                                        </span>
                                        <span className="detail-item">
                                            표면: {course.surface}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <div className="map-container">
                        <KakaoMap />
                    </div>
                )}
            </div>

            {/* 선택된 코스 상세 정보 */}
            {selectedCourse && (
                <div className="course-detail-modal">
                    <div className="modal-content">
                        <div className="modal-header">
                            <h2>{selectedCourse.name}</h2>
                            <button
                                className="close-modal"
                                onClick={() => onCourseSelect(null)}
                            >
                                ×
                            </button>
                        </div>
                        <div className="modal-body">
                            <div className="course-stats">
                                <div className="stat-item">
                                    <span className="stat-label">거리</span>
                                    <span className="stat-value">
                                        {selectedCourse.distance}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">난이도</span>
                                    <span className="stat-value">
                                        {selectedCourse.difficulty}
                                    </span>
                                </div>
                                <div className="stat-item">
                                    <span className="stat-label">평점</span>
                                    <span className="stat-value">
                                        ⭐ {selectedCourse.rating}
                                    </span>
                                </div>
                            </div>
                            <p className="course-description-full">
                                {selectedCourse.description}
                            </p>
                            <div className="action-buttons">
                                <button className="btn-primary">
                                    코스 시작하기
                                </button>
                                <button className="btn-secondary">
                                    즐겨찾기 추가
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default MainContent;
