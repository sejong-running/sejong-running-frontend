import React, { useState } from "react";
import "./CourseList.css";
import { toggleCourseLike } from "../../services/coursesService";
import { useUser } from "../../contexts/UserContext";

const CourseList = ({ courses, onCourseSelect, selectedCourse, onCourseLike }) => {
    const [loadingLikes, setLoadingLikes] = useState({});
    const { currentUserId } = useUser();

    const handleLikeClick = async (e, courseId) => {
        e.stopPropagation();
        
        if (!currentUserId) {
            console.error('사용자가 선택되지 않았습니다.');
            return;
        }
        
        setLoadingLikes(prev => ({ ...prev, [courseId]: true }));
        
        try {
            const result = await toggleCourseLike(currentUserId, courseId);
            if (result.success && onCourseLike) {
                onCourseLike(courseId, result.likesCount, result.isLiked);
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
        } finally {
            setLoadingLikes(prev => ({ ...prev, [courseId]: false }));
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
                                className={`like-button ${loadingLikes[course.id] ? 'loading' : ''}`}
                                onClick={(e) => handleLikeClick(e, course.id)}
                                disabled={loadingLikes[course.id]}
                                aria-label="좋아요"
                            >
                                <span className="likes-count">
                                    ❤️ {course.likesCount}
                                </span>
                            </button>
                        </div>
                    </div>

                    <div className="course-tags">
                        {course.tags && course.tags.length > 0 && course.tags.map((tag, index) => (
                            <span key={index} className="tag">
                                {tag}
                            </span>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default CourseList;
