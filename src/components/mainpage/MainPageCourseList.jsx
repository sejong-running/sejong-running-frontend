import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../store/modalSlice";
import styles from "./MainPageCourseList.module.css";
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
}) => {
    const dispatch = useDispatch();
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
        dispatch(openModal(course));
    };

    return (
        <div className={styles["course-list"]}>
            {courses.map((course) => (
                <div
                    key={course.id}
                    className={`${styles["course-item"]} ${
                        selectedCourse?.id === course.id ? styles.selected : ""
                    }`}
                    onClick={() => onCourseSelect(course)}
                >
                    <button
                        className={styles["dots-button"]}
                        onClick={(e) => handleViewDetailClick(e, course)}
                        aria-label="상세 정보 보기"
                    >
                        <img
                            src="/icons/dots.png"
                            alt="더보기"
                            className={styles["dots-icon"]}
                        />
                    </button>

                    <div className={styles["course-header"]}>
                        <h3 className={styles["mainpage-course-list-title"]}>
                            {course.title}
                        </h3>
                    </div>

                    <div className={styles["course-details"]}>
                        <div className={styles["course-info"]}>
                            <span className={styles["info-item"]}>
                                <img
                                    src="/icons/course.png"
                                    alt="거리"
                                    className={styles["distance-icon"]}
                                />
                                {course.distance}km
                            </span>
                            <div className={styles["course-creator"]}>
                                <img
                                    src="/icons/user_icon.png"
                                    alt="사용자"
                                    className={styles["creator-icon"]}
                                />
                                {course.creatorName}
                            </div>
                        </div>

                        <div className={styles["course-likes"]}>
                            <button
                                className={`${styles["like-button"]} ${
                                    loadingLikes[course.id]
                                        ? styles.loading
                                        : ""
                                } ${
                                    likedCourses.has(course.id)
                                        ? styles.liked
                                        : ""
                                }`}
                                onClick={(e) => handleLikeClick(e, course.id)}
                                disabled={loadingLikes[course.id]}
                                aria-label={
                                    likedCourses.has(course.id)
                                        ? "좋아요 취소"
                                        : "좋아요"
                                }
                            >
                                <span className={styles.likes}>
                                    <img
                                        src="/icons/heart_icon.png"
                                        alt="좋아요"
                                        className={styles["heart-icon"]}
                                    />
                                    {course.likesCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className={styles["mainpage-course-list-tags"]}>
                        {course.tags &&
                            course.tags.length > 0 &&
                            [...course.tags]
                                .sort((a, b) => b.localeCompare(a))
                                .map((tag, index) => (
                                    <span
                                        key={index}
                                        className={
                                            styles["mainpage-course-list-tag"]
                                        }
                                    >
                                        #{tag}
                                    </span>
                                ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
