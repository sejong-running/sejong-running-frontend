import React, { useState } from "react";
import "./MyPage.css";
import RunningCard from "../components/RunningCard";
import {
    favoriteCourses,
    myRunningCourses,
    myPageStats,
} from "../data/myPageData";

const MyPage = () => {
    const [activeTab, setActiveTab] = useState("favorites");
    const [key, setKey] = useState(0); // 리로드용 키

    const handleTabChange = (tab) => {
        setActiveTab(tab);
        // 탭 변경 시 컴포넌트 리로드
        setKey((prevKey) => prevKey + 1);
    };

    const handleFavoriteToggle = (courseId) => {
        // 즐겨찾기 토글 로직 (실제 구현에서는 상태 관리 라이브러리 사용)
        console.log("즐겨찾기 토글:", courseId);
    };

    const handleViewDetails = (course) => {
        // 코스 상세보기 로직
        console.log("코스 상세보기:", course);
    };

    const formatTime = (minutes) => {
        const hours = Math.floor(minutes / 60);
        const mins = minutes % 60;
        return hours > 0 ? `${hours}시간 ${mins}분` : `${mins}분`;
    };

    const EmptyState = ({ icon, title, description }) => (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <div className="empty-state-title">{title}</div>
            <div className="empty-state-description">{description}</div>
        </div>
    );

    return (
        <div className="my-page">
            {/* 페이지 헤더 */}
            <div className="page-header">
                <h1 className="page-title">마이페이지</h1>
                <p className="page-subtitle">
                    나의 러닝 기록과 즐겨찾기를 확인해보세요
                </p>
            </div>

            {/* 통계 카드 */}
            <div className="stats-container">
                <div className="stat-card">
                    <div className="stat-number">{myPageStats.totalRuns}</div>
                    <div className="stat-label">총 러닝 횟수</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {myPageStats.totalDistance.toFixed(1)}km
                    </div>
                    <div className="stat-label">총 거리</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {formatTime(myPageStats.totalTime)}
                    </div>
                    <div className="stat-label">총 시간</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {myPageStats.favoriteCount}
                    </div>
                    <div className="stat-label">즐겨찾기</div>
                </div>
                <div className="stat-card">
                    <div className="stat-number">
                        {myPageStats.personalBests}
                    </div>
                    <div className="stat-label">개인 최고 기록</div>
                </div>
            </div>

            {/* 탭 네비게이션 */}
            <div className="tab-navigation">
                <button
                    className={`tab-button ${
                        activeTab === "favorites" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("favorites")}
                >
                    ❤️ 즐겨찾기 ({favoriteCourses.length})
                </button>
                <button
                    className={`tab-button ${
                        activeTab === "running" ? "active" : ""
                    }`}
                    onClick={() => handleTabChange("running")}
                >
                    🏃‍♂️ 내가 뛴 코스 ({myRunningCourses.length})
                </button>
            </div>

            {/* 즐겨찾기 탭 */}
            <div
                className={`tab-content ${
                    activeTab === "favorites" ? "active" : ""
                }`}
            >
                {favoriteCourses.length > 0 ? (
                    <div className="courses-grid" key={`favorites-${key}`}>
                        {favoriteCourses.map((course) => (
                            <RunningCard
                                key={`${course.id}-${key}`}
                                course={course}
                                onFavorite={handleFavoriteToggle}
                                onViewDetails={handleViewDetails}
                                isFavorite={course.isFavorite}
                            />
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="❤️"
                        title="아직 즐겨찾기한 코스가 없어요"
                        description="마음에 드는 코스에 좋아요를 눌러보세요!"
                    />
                )}
            </div>

            {/* 내가 뛴 코스 탭 */}
            <div
                className={`tab-content ${
                    activeTab === "running" ? "active" : ""
                }`}
            >
                {myRunningCourses.length > 0 ? (
                    <div className="courses-grid" key={`running-${key}`}>
                        {myRunningCourses.map((course) => (
                            <div key={`${course.id}-${key}`}>
                                <RunningCard
                                    course={course}
                                    onFavorite={handleFavoriteToggle}
                                    onViewDetails={handleViewDetails}
                                    isFavorite={course.isFavorite}
                                />
                                {/* 러닝 기록 추가 정보 */}
                                <div className="running-record-info">
                                    <div className="record-metrics">
                                        <div className="record-metric">
                                            <span>🏃‍♂️ 실제 거리:</span>
                                            <strong>
                                                {course.actualDistance}
                                            </strong>
                                        </div>
                                        <div className="record-metric">
                                            <span>⏱️ 실제 시간:</span>
                                            <strong>
                                                {course.actualDuration}
                                            </strong>
                                        </div>
                                        <div className="record-metric">
                                            <span>📅 완주일:</span>
                                            <strong>
                                                {course.completedAt}
                                            </strong>
                                        </div>
                                        {course.personalBest && (
                                            <span className="personal-best-badge">
                                                🏆 개인 최고!
                                            </span>
                                        )}
                                    </div>
                                    {course.notes && (
                                        <div className="record-notes">
                                            💭 "{course.notes}"
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>
                ) : (
                    <EmptyState
                        icon="🏃‍♂️"
                        title="아직 러닝 기록이 없어요"
                        description="첫 번째 러닝을 시작해보세요!"
                    />
                )}
            </div>
        </div>
    );
};

export default MyPage;
