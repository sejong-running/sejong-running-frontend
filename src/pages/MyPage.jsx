import React, { useState } from "react";
import "./MyPage.css";
import RunningCard from "../components/RunningCard";
import MyRunCard from "../components/MyRunCard";
import Footer from "../components/shared/Footer";
import {
    favoriteCourses,
    myRunningCourses,
    myPageStats,
} from "../data/myPageData";

const MyPage = () => {
    const [key, setKey] = useState(0); // 리로드용 키

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

            {/* 좌우 분할 레이아웃 */}
            <div className="split-layout">
                {/* 왼쪽: 즐겨찾기 */}
                <div className="left-section">
                    <div className="section-header">
                        <h2>❤️ 즐겨찾기 ({favoriteCourses.length})</h2>
                    </div>
                    <div className="section-content">
                        {favoriteCourses.length > 0 ? (
                            <div
                                className="courses-grid"
                                key={`favorites-${key}`}
                            >
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
                </div>

                {/* 오른쪽: 내가 뛴 코스 */}
                <div className="right-section">
                    <div className="section-header">
                        <h2>🏃‍♂️ 내가 뛴 코스 ({myRunningCourses.length})</h2>
                    </div>
                    <div className="section-content scrollable">
                        {myRunningCourses.length > 0 ? (
                            <div
                                className="courses-grid"
                                key={`running-${key}`}
                            >
                                {myRunningCourses.map((course) => (
                                    <MyRunCard
                                        key={`${course.id}-${key}`}
                                        course={course}
                                        onViewDetails={handleViewDetails}
                                    />
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
            </div>
            <Footer />
        </div>
    );
};

export default MyPage;
