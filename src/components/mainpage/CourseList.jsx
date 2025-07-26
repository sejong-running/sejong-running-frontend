import React, { useState, useEffect } from "react";
import "./CourseList.css";
import {
    toggleCourseLike,
    getUserLikedCourses,
} from "../../services/coursesService";
import { useUser } from "../../contexts/UserContext";

const CourseList = ({
    courses,
    onCourseSelect,
    selectedCourse,
    onCourseLike,
    onViewDetail,
}) => {
    const [loadingLikes, setLoadingLikes] = useState({});
    const [likedCourses, setLikedCourses] = useState(new Set());
    const { currentUserId } = useUser();

    // 현재 사용자가 좋아요한 코스 목록 조회
    useEffect(() => {
        const fetchLikedCourses = async () => {
            if (!currentUserId) return;

            try {
                const { likedCourseIds } = await getUserLikedCourses(
                    currentUserId
                );
                setLikedCourses(new Set(likedCourseIds));
            } catch (error) {
                console.error("좋아요한 코스 목록 조회 실패:", error);
            }
        };

        fetchLikedCourses();
    }, [currentUserId]);

    const handleLikeClick = async (e, courseId) => {
        e.stopPropagation();

        if (!currentUserId) {
            console.error("사용자가 선택되지 않았습니다.");
            return;
        }

        setLoadingLikes((prev) => ({ ...prev, [courseId]: true }));

        try {
            const result = await toggleCourseLike(currentUserId, courseId);
            if (result.success) {
                // 좋아요 상태 업데이트
                setLikedCourses((prev) => {
                    const newSet = new Set(prev);
                    if (result.isLiked) {
                        newSet.add(courseId);
                    } else {
                        newSet.delete(courseId);
                    }
                    return newSet;
                });

                if (onCourseLike) {
                    onCourseLike(courseId, result.likesCount, result.isLiked);
                }
            }
        } catch (error) {
            console.error("좋아요 처리 중 오류:", error);
        } finally {
            setLoadingLikes((prev) => ({ ...prev, [courseId]: false }));
        }
    };

    const handleViewDetailClick = (e, course) => {
        e.stopPropagation();
        if (onViewDetail) {
            onViewDetail(course);
        }
    };

    return (
        <div className="course-list">
            {courses.map((course) => (
                <div
                    key={course.id}
                    className={`course-item ${
                        selectedCourse?.id === course.id ? "selected" : ""
                    }`}
                    onClick={() => onCourseSelect(course)}
                >
                    <div className="course-header">
                        <h3 className="course-title">{course.title}</h3>
                    </div>

                    <p className="course-description">{course.description}</p>

                    <div className="course-details">
                        <div className="course-info">
                            <span className="info-item">
                                📏 {course.distance}km
                            </span>
                            <span className="info-item">
                                👤 {course.creatorName}
                            </span>
                        </div>

                        <div className="course-likes">
                            <button
                                className={`like-button ${
                                    loadingLikes[course.id] ? "loading" : ""
                                } ${
                                    likedCourses.has(course.id) ? "liked" : ""
                                }`}
                                onClick={(e) => handleLikeClick(e, course.id)}
                                disabled={loadingLikes[course.id]}
                                aria-label={
                                    likedCourses.has(course.id)
                                        ? "좋아요 취소"
                                        : "좋아요"
                                }
                            >
                                <span className="likes-count">
                                    ❤️ {course.likesCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="course-tags">
                        {course.tags &&
                            course.tags.length > 0 &&
                            course.tags.map((tag, index) => (
                                <span key={index} className="tag">
                                    {tag}
                                </span>
                            ))}
                    </div>

                    <div className="course-detail-action">
                        <button
                            className="detail-button"
                            onClick={(e) => handleViewDetailClick(e, course)}
                            aria-label="상세 정보 보기"
                        >
                            상세 정보 보기
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
