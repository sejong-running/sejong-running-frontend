import React, { useState, useEffect, useMemo } from "react";
import "./MyPage.css";
import Header from "../components/shared/HeaderController";
import Footer from "../components/shared/Footer";
import RunningStats from "../components/mypage/RunningStats";
import MonthlyDistanceChart from "../components/mypage/MonthlyDistanceChart";
import {
    Tabs,
    TabsList,
    TabsTrigger,
    TabsContent,
} from "../components/mypage/Tabs";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import RunningCard from "../components/mypage/RunningCard";
import { useUser } from "../contexts/UserContext";
import {
    fetchUserStats,
    fetchUserFavorites,
    fetchUserRunRecords,
} from "../services";

const MyPage = () => {
    const { currentUserId, users } = useUser();
    const [key] = useState(0); // 리로드용 키
    const [userStats, setUserStats] = useState(null);
    const [favoriteCourses, setFavoriteCourses] = useState([]);
    const [myRunningCourses, setMyRunningCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [activeTab, setActiveTab] = useState("history");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedCourse, setSelectedCourse] = useState(null);

    const currentUser = users.find((user) => user.id === currentUserId);

    // 사용자 데이터 로드
    useEffect(() => {
        const loadUserData = async () => {
            if (!currentUserId) return;

            try {
                setLoading(true);
                setError(null);

                // 병렬로 모든 데이터 로드
                const [statsResult, favoritesResult, runRecordsResult] = await Promise.all([
                    fetchUserStats(currentUserId),
                    fetchUserFavorites(currentUserId),
                    fetchUserRunRecords(currentUserId),
                ]);

                // 에러 확인
                if (statsResult.error) throw new Error(statsResult.error);
                if (favoritesResult.error) throw new Error(favoritesResult.error);
                if (runRecordsResult.error) throw new Error(runRecordsResult.error);

                setUserStats(statsResult.data);
                setFavoriteCourses(favoritesResult.data);
                setMyRunningCourses(runRecordsResult.data);
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
        // 좋아요 토글 로직 (실제 구현에서는 상태 관리 라이브러리 사용)
        console.log("좋아요 토글:", courseId);
    };

    const handleViewDetails = (course) => {
        // 코스 데이터 준비
        const courseData = {
            id: course.courses?.id || course.id,
            title: course.courses?.title || course.title,
            distance: course.courses?.distance || course.distance,
            description: course.courses?.description || course.description,
            rating: course.rating || "4.5",
            likes: course.likes || "754",
            reviews: course.reviews || "127",
        };

        setSelectedCourse(courseData);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedCourse(null);
    };

    const handleModalFavorite = (courseId) => {
        handleFavoriteToggle(courseId);
        // 모달에서 좋아요 버튼 클릭 시 추가 로직
        console.log("모달에서 좋아요:", courseId);
    };

    const handleModalViewMap = (course) => {
        // 지도에서 보기 로직
        console.log("지도에서 보기:", course);
        handleCloseModal();
    };


    const formatPace = (paceSeconds) => {
        if (!paceSeconds) return "-";
        const minutes = Math.floor(paceSeconds / 60);
        const seconds = Math.floor(paceSeconds % 60);
        return `${minutes}:${seconds.toString().padStart(2, "0")}/km`;
    };

    // 통계 데이터 준비
    const statsData = useMemo(() => ({
        totalRuns: userStats?.total_runs || 0,
        totalDistance: userStats?.total_distance_km || 0,
        bestPace: formatPace(userStats?.best_pace),
        favorites: favoriteCourses.length,
    }), [userStats, favoriteCourses.length]);

    // 좋아요 코스 데이터 메모이제이션
    const memoizedFavoriteCourses = useMemo(() => 
        favoriteCourses.map((item) => ({
            id: item.course_id,
            title: item.courses.title,
            description: item.courses.description,
            distance: `${item.courses.distance}km`,
            duration: "약 25분",
            difficulty: "보통",
            geomJson: item.courses.geomJson,
            minLatitude: item.courses.min_latitude,
            maxLatitude: item.courses.max_latitude,
            minLongitude: item.courses.min_longitude,
            maxLongitude: item.courses.max_longitude,
            tags: item.courses.tags || []
        })), [favoriteCourses]);

    const EmptyState = ({ icon, title, description, actionText, onAction }) => (
        <div className="empty-state">
            <div className="empty-state-icon">{icon}</div>
            <h3 className="empty-state-title">{title}</h3>
            <p className="empty-state-description">{description}</p>
            {actionText && onAction && (
                <button className="empty-state-action" onClick={onAction}>
                    {actionText}
                </button>
            )}
        </div>
    );

    return (
        <div className="my-page">
            <Header />

            <div className="container">
                {/* 페이지 헤더 */}
                <div className="page-header">
                    <h1 className="page-title">
                        {loading
                            ? "로딩 중..."
                            : currentUser
                            ? `${currentUser.username}님의 러닝 페이지`
                            : "나의 러닝 페이지"}
                    </h1>
                    <p className="page-subtitle">
                        {error
                            ? "데이터를 불러오는데 실패했습니다."
                            : "나의 러닝 기록과 좋아요를 확인해보세요"}
                    </p>
                </div>

                {/* 통계 카드 */}
                {loading ? (
                    <div className="loading-stats">
                        <div className="loading-spinner">⏳</div>
                        <p>통계를 불러오는 중...</p>
                    </div>
                ) : error ? (
                    <div className="error-stats">
                        <div className="error-icon">⚠️</div>
                        <p>통계를 불러오는데 실패했습니다.</p>
                    </div>
                ) : (
                    <RunningStats stats={statsData} />
                )}

                {/* 월별 차트 */}
                {!loading && !error && <MonthlyDistanceChart />}

                {/* 탭 기반 콘텐츠 */}
                <div className="tabs-section">
                    <Tabs activeTab={activeTab} onTabChange={setActiveTab}>
                        <TabsList>
                            <TabsTrigger
                                value="history"
                                active={activeTab === "history"}
                                onClick={setActiveTab}
                            >
                                내가 뛴 코스 ({myRunningCourses.length})
                            </TabsTrigger>
                            <TabsTrigger
                                value="favorites"
                                active={activeTab === "favorites"}
                                onClick={setActiveTab}
                            >
                                좋아요 ({favoriteCourses.length})
                            </TabsTrigger>
                        </TabsList>

                        <TabsContent
                            value="history"
                            active={activeTab === "history"}
                        >
                            {loading ? (
                                <div className="loading-content">
                                    <div className="loading-spinner">⏳</div>
                                    <p>러닝 기록을 불러오는 중...</p>
                                </div>
                            ) : error ? (
                                <div className="error-content">
                                    <div className="error-icon">⚠️</div>
                                    <p>러닝 기록을 불러오는데 실패했습니다.</p>
                                </div>
                            ) : myRunningCourses.length > 0 ? (
                                <div className="courses-list">
                                    {myRunningCourses.map((record) => (
                                        <div
                                            key={`${record.id}-${key}`}
                                            className="course-card"
                                        >
                                            <div className="course-header">
                                                <h3 className="course-title">
                                                    {record.courses.title}
                                                </h3>
                                                <span className="course-date">
                                                    {new Date(
                                                        record.created_time
                                                    ).toLocaleDateString(
                                                        "ko-KR",
                                                        {
                                                            year: "numeric",
                                                            month: "long",
                                                            day: "numeric",
                                                        }
                                                    )}
                                                </span>
                                            </div>
                                            <div className="course-stats">
                                                <div className="stat-item">
                                                    <span className="stat-icon">
                                                        📍
                                                    </span>
                                                    <span className="stat-text">
                                                        {
                                                            record.actual_distance_km
                                                        }{" "}
                                                        km
                                                    </span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-icon">
                                                        ⏱️
                                                    </span>
                                                    <span className="stat-text">
                                                        {Math.floor(
                                                            record.actual_duration_sec /
                                                                60
                                                        )}
                                                        분
                                                    </span>
                                                </div>
                                                <div className="stat-item">
                                                    <span className="stat-icon">
                                                        📊
                                                    </span>
                                                    <span className="stat-text">
                                                        페이스{" "}
                                                        {formatPace(
                                                            record.actual_pace
                                                        )}
                                                        /km
                                                    </span>
                                                </div>
                                            </div>
                                            <div className="course-actions">
                                                <button
                                                    className="action-button"
                                                    onClick={() =>
                                                        handleViewDetails(
                                                            record
                                                        )
                                                    }
                                                >
                                                    코스 상세보기 →
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="🏃‍♂️"
                                    title="아직 러닝 기록이 없어요"
                                    description="첫 번째 러닝을 시작해보세요!"
                                    actionText="러닝 시작하기"
                                    onAction={() => console.log("러닝 시작")}
                                />
                            )}
                        </TabsContent>

                        <TabsContent
                            value="favorites"
                            active={activeTab === "favorites"}
                        >
                            {loading ? (
                                <div className="loading-content">
                                    <div className="loading-spinner">⏳</div>
                                    <p>좋아요를 불러오는 중...</p>
                                </div>
                            ) : error ? (
                                <div className="error-content">
                                    <div className="error-icon">⚠️</div>
                                    <p>좋아요를 불러오는데 실패했습니다.</p>
                                </div>
                            ) : favoriteCourses.length > 0 ? (
                                <div className="courses-grid">
                                    {memoizedFavoriteCourses.map((course) => (
                                        <RunningCard
                                            key={course.id}
                                            course={course}
                                            onViewDetails={handleViewDetails}
                                        />
                                    ))}
                                </div>
                            ) : (
                                <EmptyState
                                    icon="❤️"
                                    title="아직 좋아요한 코스가 없어요"
                                    description="마음에 드는 코스에 좋아요를 눌러보세요!"
                                    actionText="코스 둘러보기"
                                    onAction={() =>
                                        console.log("코스 둘러보기")
                                    }
                                />
                            )}
                        </TabsContent>
                    </Tabs>
                </div>
            </div>

            {/* 코스 상세보기 모달 */}
            <CourseDetailModal
                course={selectedCourse}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFavorite={handleModalFavorite}
                onViewMap={handleModalViewMap}
            />

            <Footer />
        </div>
    );
};

export default MyPage;
