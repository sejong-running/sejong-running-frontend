import React from "react";
import "./CourseList.css";

const CourseList = ({ courses, onCourseSelect, selectedCourse }) => {

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
                            <span className="likes-count">
                                ❤️ {course.likesCount}
                            </span>
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
