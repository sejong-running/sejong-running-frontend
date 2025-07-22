import React, { useState } from "react";
import "./MainContent.css";
import RunningCard from "./RunningCard";
import KakaoMap from "./KakaoMap";

const MainContent = ({ selectedCourse, onCourseSelect }) => {
    const [viewMode, setViewMode] = useState("grid"); // "grid" or "map"
    const [favorites, setFavorites] = useState(new Set());

    const featuredCourses = [
        {
            id: 1,
            title: "세종호수공원 둘레길",
            description: "세종시의 대표 호수공원을 둘러보는 평탄한 코스",
            distance: "4.2km",
            duration: "25분",
            difficulty: "초급",
            rating: 4.8,
            image: null, // 이미지가 없으면 플레이스홀더 표시
            tags: ["인생샷스팟", "아이와함께"],
            hasVideo: true,
        },
        {
            id: 2,
            title: "금강변 트레일",
            description: "자연 속에서 즐기는 중급자용 트레일 코스",
            distance: "8.7km",
            duration: "45분",
            difficulty: "중급",
            rating: 4.6,
            image: null,
            tags: ["자연", "트레일"],
            hasVideo: false,
        },
        {
            id: 3,
            title: "도시공원 순환로",
            description: "도시 한가운데에서 즐기는 짧은 러닝 코스",
            distance: "3.1km",
            duration: "18분",
            difficulty: "초급",
            rating: 4.2,
            image: null,
            tags: ["도시", "가족"],
            hasVideo: true,
        },
        {
            id: 4,
            title: "산림욕장 등산로",
            description: "도전적인 산악 러닝을 원하는 고급자용 코스",
            distance: "12.3km",
            duration: "1시간 15분",
            difficulty: "고급",
            rating: 4.7,
            image: null,
            tags: ["산악", "도전"],
            hasVideo: false,
        },
        {
            id: 5,
            title: "한강공원 러닝코스",
            description: "한강을 따라 달리는 상쾌한 러닝 경험",
            distance: "6.8km",
            duration: "35분",
            difficulty: "중급",
            rating: 4.5,
            image: null,
            tags: ["한강", "상쾌"],
            hasVideo: true,
        },
        {
            id: 6,
            title: "벚꽃길 산책로",
            description: "봄철 벚꽃이 만발한 아름다운 산책로",
            distance: "2.5km",
            duration: "15분",
            difficulty: "초급",
            rating: 4.9,
            image: null,
            tags: ["벚꽃", "봄"],
            hasVideo: false,
        },
    ];

    const handleFavorite = (courseId) => {
        const newFavorites = new Set(favorites);
        if (newFavorites.has(courseId)) {
            newFavorites.delete(courseId);
        } else {
            newFavorites.add(courseId);
        }
        setFavorites(newFavorites);
    };

    const handleViewDetails = (course) => {
        onCourseSelect(course);
    };

    const handlePlayVideo = (courseId) => {
        console.log(`비디오 재생: 코스 ${courseId}`);
        // 비디오 재생 로직 구현
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
                            <RunningCard
                                key={course.id}
                                course={course}
                                isFavorite={favorites.has(course.id)}
                                onFavorite={handleFavorite}
                                onViewDetails={handleViewDetails}
                                onPlayVideo={handlePlayVideo}
                            />
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
                            <h2>{selectedCourse.title}</h2>
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
                                    <span className="stat-label">시간</span>
                                    <span className="stat-value">
                                        {selectedCourse.duration}
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
                            {selectedCourse.tags &&
                                selectedCourse.tags.length > 0 && (
                                    <div className="course-tags-full">
                                        {selectedCourse.tags.map(
                                            (tag, index) => (
                                                <span
                                                    key={index}
                                                    className="tag-full"
                                                >
                                                    #{tag}
                                                </span>
                                            )
                                        )}
                                    </div>
                                )}
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
