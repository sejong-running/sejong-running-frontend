import React, { useState, useEffect } from "react";
import "./MyPage.css";
import Header from "../components/shared/Header";
import RunningCard from "../components/RunningCard";
import MyRunCard from "../components/MyRunCard";
import Footer from "../components/shared/Footer";
import { useUser } from "../contexts/UserContext";
import {
    fetchUserStats,
    fetchUserFavorites,
    fetchUserRunRecords,
} from "../utils/userService";

const MyPage = () => {
    const { currentUserId, users } = useUser();
    const [key] = useState(0); // 리로드용 키
    const [userStats, setUserStats] = useState(null);
    const [favoriteCourses, setFavoriteCourses] = useState([]);
    const [myRunningCourses, setMyRunningCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    const currentUser = users.find((user) => user.id === currentUserId);

    // 사용자 데이터 로드
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUserId) return;

            try {
                setLoading(true);
                setError(null);

                // 병렬로 모든 데이터 로드
                const [stats, favorites, runRecords] = await Promise.all([
                    fetchUserStats(currentUserId),
                    fetchUserFavorites(currentUserId),
                    fetchUserRunRecords(currentUserId),
                ]);

                setUserStats(stats);
                setFavoriteCourses(favorites);
                setMyRunningCourses(runRecords);
            } catch (err) {
                setError("사용자 데이터를 불러오는데 실패했습니다.");
                console.error("사용자 데이터 로드 실패:", err);
            } finally {
                setLoading(false);
            }
        };

        loadUserData();
    }, [currentUserId]);

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

    const formatPace = (paceSeconds) => {
        if (!paceSeconds) return "-";
        const minutes = Math.floor(paceSeconds / 60);
        const seconds = Math.floor(paceSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
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
            <Header />
            {/* 페이지 헤더 */}
            <div className="page-header">
                <h1 className="page-title">
                    {loading
                        ? "로딩 중..."
                        : currentUser
                        ? `${currentUser.username}님의 마이페이지`
                        : "마이페이지"}
                </h1>
                <p className="page-subtitle">
                    {error
                        ? "데이터를 불러오는데 실패했습니다."
                        : "나의 러닝 기록과 즐겨찾기를 확인해보세요"}
                </p>
            </div>

            {/* 통계 카드 */}
            {loading ? (
                <div className="stats-container">
                    <div className="stat-card loading">
                        <div className="stat-number">-</div>
                        <div className="stat-label">로딩 중...</div>
                    </div>
                </div>
            ) : error ? (
                <div className="stats-container">
                    <div className="stat-card error">
                        <div className="stat-number">⚠️</div>
                        <div className="stat-label">데이터 로드 실패</div>
                    </div>
                </div>
            ) : (
                <div className="stats-container">
                    <div className="stat-card">
                        <div className="stat-number">
                            {userStats?.total_runs || 0}
                        </div>
                        <div className="stat-label">총 러닝 횟수</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {(userStats?.total_distance_km || 0).toFixed(1)}km
                        </div>
                        <div className="stat-label">총 거리</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {formatPace(userStats?.best_pace)}
                        </div>
                        <div className="stat-label">최고 페이스</div>
                    </div>
                    <div className="stat-card">
                        <div className="stat-number">
                            {favoriteCourses.length}
                        </div>
                        <div className="stat-label">즐겨찾기</div>
                    </div>
                </div>
            )}

            {/* 좌우 분할 레이아웃 */}
            <div className="split-layout">
                {/* 왼쪽: 즐겨찾기 */}
                <div className="left-section">
                    <div className="section-header">
                        <h2>❤️ 즐겨찾기 ({favoriteCourses.length})</h2>
                    </div>
                    <div className="section-content">
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner">⏳</div>
                                <p>즐겨찾기 목록을 불러오는 중...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <div className="error-icon">⚠️</div>
                                <p>즐겨찾기 목록을 불러오는데 실패했습니다.</p>
                            </div>
                        ) : favoriteCourses.length > 0 ? (
                            <div
                                className="courses-grid"
                                key={`favorites-${key}`}
                            >
                                {favoriteCourses.map((item) => (
                                    <RunningCard
                                        key={`${item.course_id}-${key}`}
                                        course={{
                                            id: item.courses.id,
                                            title: item.courses.title,
                                            description:
                                                item.courses.description,
                                            distance: `${item.courses.distance}km`,
                                            duration: "25분", // 임시값
                                            difficulty: "초급", // 임시값
                                            rating: 4.5, // 임시값
                                            image: null,
                                            tags: [], // 임시값
                                            favoritedAt: item.created_time,
                                            isFavorite: true,
                                        }}
                                        onFavorite={handleFavoriteToggle}
                                        onViewDetails={handleViewDetails}
                                        isFavorite={true}
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
                        {loading ? (
                            <div className="loading-state">
                                <div className="loading-spinner">⏳</div>
                                <p>러닝 기록을 불러오는 중...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <div className="error-icon">⚠️</div>
                                <p>러닝 기록을 불러오는데 실패했습니다.</p>
                            </div>
                        ) : myRunningCourses.length > 0 ? (
                            <div
                                className="courses-grid"
                                key={`running-${key}`}
                            >
                                {myRunningCourses.map((record) => (
                                    <MyRunCard
                                        key={`${record.id}-${key}`}
                                        course={{
                                            id: record.courses.id,
                                            title: record.courses.title,
                                            description:
                                                record.courses.description,
                                            distance: `${record.courses.distance}km`,
                                            duration: "25분", // 임시값
                                            difficulty: "초급", // 임시값
                                            rating: 4.5, // 임시값
                                            image: null,
                                            tags: [], // 임시값
                                            completedAt: record.created_time,
                                            actualDistance: `${record.actual_distance_km}km`,
                                            actualDuration: `${Math.floor(
                                                record.actual_duration_sec / 60
                                            )}분`,
                                            personalBest: false, // 임시값
                                            notes: `페이스: ${formatPace(
                                                record.actual_pace
                                            )}`,
                                        }}
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
