import React from "react";
import "./CourseList.css";

const CourseList = ({ courses, onCourseSelect, selectedCourse }) => {
    const getDifficultyColor = (difficulty) => {
        switch (difficulty) {
            case "초급":
                return "#28a745";
            case "중급":
                return "#ffc107";
            case "고급":
                return "#dc3545";
            default:
                return "#6c757d";
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
                        <div className="course-rating">⭐ {course.rating}</div>
                    </div>

                    <p className="course-description">{course.description}</p>

                    <div className="course-details">
                        <div className="course-info">
                            <span className="info-item">
                                📏 {course.distance}
                            </span>
                            <span className="info-item">
                                ⏱️ {course.duration}
                            </span>
                        </div>

                        <div className="course-difficulty">
                            <span
                                className="difficulty-badge"
                                style={{
                                    backgroundColor: getDifficultyColor(
                                        course.difficulty
                                    ),
                                }}
                            >
                                {course.difficulty}
                            </span>
                        </div>
                    </div>

                    <div className="course-tags">
                        {course.tags.map((tag, index) => (
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
