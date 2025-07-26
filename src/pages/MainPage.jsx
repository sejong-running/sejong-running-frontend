import React, { useState, useEffect, useMemo } from "react";
import "./MainPage.css";
import Header from "../components/shared/HeaderController";
import KakaoMap from "../components/map/KakaoMap";
import CourseList from "../components/mainpage/MainPageCourseList";
import CourseFilter from "../components/mainpage/CourseFilter";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import ListHeader from "../components/mainpage/MainPageListHeader";
import { getAllCourses, getAllCourseTypes } from "../services";

const MainPage = () => {
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [courses, setCourses] = useState([]);
    const [courseTypes, setCourseTypes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [sidebarOpen, setSidebarOpen] = useState(true);
    const [modalCourse, setModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [filters, setFilters] = useState({
        sortBy: "name",
        sortDirection: "asc",
        selectedTypes: [],
        distanceRange: [0, 0],
    });

    // 코스 데이터와 코스 유형 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);

                // 코스 데이터와 코스 유형 데이터를 병렬로 로드
                const [coursesResult, typesResult] = await Promise.all([
                    getAllCourses(),
                    getAllCourseTypes(),
                ]);

                if (coursesResult.error) {
                    setError(coursesResult.error);
                } else {
                    setCourses(coursesResult.data);

                    // 최대 거리 계산하여 필터 초기화
                    const maxDistance = Math.max(
                        ...coursesResult.data.map((course) => course.distance)
                    );
                    setFilters((prev) => ({
                        ...prev,
                        distanceRange: [0, maxDistance],
                    }));
                }

                if (typesResult.error) {
                    console.error("코스 유형 로드 실패:", typesResult.error);
                } else {
                    setCourseTypes(typesResult.data);
                }
            } catch (err) {
                setError("데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    // 필터링된 코스 목록 계산
    const filteredCourses = useMemo(() => {
        let filtered = [...courses];

        // 코스 유형 필터링 (AND 조건)
        if (filters.selectedTypes.length > 0) {
            filtered = filtered.filter((course) => {
                const courseTypeIds = course.tags
                    .map((tag) => {
                        const type = courseTypes.find((t) => t.name === tag);
                        return type ? type.id : null;
                    })
                    .filter((id) => id !== null);

                return filters.selectedTypes.every((selectedTypeId) =>
                    courseTypeIds.includes(selectedTypeId)
                );
            });
        }

        // 거리 범위 필터링
        filtered = filtered.filter(
            (course) =>
                course.distance >= filters.distanceRange[0] &&
                course.distance <= filters.distanceRange[1]
        );

        // 정렬
        filtered.sort((a, b) => {
            let comparison = 0;
            
            if (filters.sortBy === "name") {
                comparison = a.title.localeCompare(b.title);
            } else if (filters.sortBy === "popular") {
                comparison = a.likesCount - b.likesCount;
            } else if (filters.sortBy === "latest") {
                comparison = new Date(a.createdTime) - new Date(b.createdTime);
            }
            
            // 방향에 따라 정렬 순서 결정
            return filters.sortDirection === 'asc' ? comparison : -comparison;
        });

        return filtered;
    }, [courses, filters, courseTypes]);

    const handleCourseSelect = (course) => {
        // 같은 코스를 다시 클릭하면 선택 취소
        if (selectedCourse?.id === course.id) {
            setSelectedCourse(null);
            console.log("코스 선택 취소");
        } else {
            setSelectedCourse(course);
            console.log("선택된 코스:", course);
        }
    };

    const handleCourseLike = (courseId, newLikesCount, isLiked) => {
        setCourses((prevCourses) =>
            prevCourses.map((course) =>
                course.id === courseId
                    ? { ...course, likesCount: newLikesCount }
                    : course
            )
        );
        console.log(
            `코스 ${courseId} 좋아요 ${isLiked ? "추가" : "제거"
            }, 총 ${newLikesCount}개`
        );
    };

    const handleViewDetail = (course) => {
        setModalCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalCourse(null);
    };

    const handleModalFavorite = (courseId) => {
        // 모달에서 좋아요 처리
        console.log(`모달에서 코스 ${courseId} 좋아요 처리`);
        // 여기서 좋아요 로직을 구현하거나 기존 로직을 재사용할 수 있습니다
    };

    const handleModalViewMap = (course) => {
        // 모달에서 지도 보기 처리
        setSelectedCourse(course);
        setIsModalOpen(false);
        console.log(`모달에서 코스 ${course.id} 지도 보기`);
    };

    const handleFilterChange = (newFilters) => {
        setFilters(newFilters);
    };

    // 최대 거리 계산
    const maxDistance = Math.max(
        ...courses.map((course) => course.distance),
        0
    );

    return (
        <div className="main-page-container">
            <Header />
            <div className="main-page">
                <div className="main-content">
                    <KakaoMap
                        width="100%"
                        height="100%"
                        courses={filteredCourses}
                        selectedCourseId={selectedCourse?.id}
                        controllable={true}
                        fitBoundsOnChange={false}
                        boundsPadding={100}
                        onMapLoad={(map) => console.log("맵 로드 완료:", map)}
                    />
                </div>
                <div className={`sidebar${sidebarOpen ? "" : " closed"}`}>
                    <button
                        className="sidebar-toggle-btn"
                        onClick={() => setSidebarOpen((prev) => !prev)}
                        aria-label={
                            sidebarOpen ? "리스트 접기" : "리스트 펼치기"
                        }
                    >
                        {sidebarOpen ? "⟩" : "⟨"}
                    </button>
                    <div className="sidebar-content">
                        <ListHeader 
                            title="코스 목록"
                            count={filteredCourses.length}
                            loading={loading}
                        />
                        {loading ? (
                            <div className="loading-state">
                                <p>코스 정보를 불러오고 있습니다...</p>
                            </div>
                        ) : error ? (
                            <div className="error-state">
                                <p>오류: {error}</p>
                                <button
                                    onClick={() => window.location.reload()}
                                >
                                    다시 시도
                                </button>
                            </div>
                        ) : (
                            <>
                                <CourseFilter
                                    onFilterChange={handleFilterChange}
                                    courseTypes={courseTypes}
                                    maxDistance={maxDistance}
                                    initialFilters={filters}
                                />
                                <CourseList
                                    courses={filteredCourses}
                                    onCourseSelect={handleCourseSelect}
                                    selectedCourse={selectedCourse}
                                    onCourseLike={handleCourseLike}
                                    onViewDetail={handleViewDetail}
                                />
                            </>
                        )}
                    </div>
                </div>
            </div>

            {/* 코스 상세 정보 모달 */}
            <CourseDetailModal
                course={modalCourse}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onFavorite={handleModalFavorite}
                onViewMap={handleModalViewMap}
            />
        </div>
    );
};

export default MainPage;
