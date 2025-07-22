import React, { useState } from "react";
import "./Sidebar.css";

const Sidebar = ({ isOpen, onClose, onCourseSelect }) => {
    const [filters, setFilters] = useState({
        distance: "all",
        difficulty: "all",
        region: "all",
    });

    const sampleCourses = [
        {
            id: 1,
            name: "세종호수공원 러닝코스",
            distance: "5.2km",
            difficulty: "초급",
            region: "세종시",
            rating: 4.5,
            image: "🏃‍♂️",
        },
        {
            id: 2,
            name: "금강변 트레일",
            distance: "8.7km",
            difficulty: "중급",
            region: "세종시",
            rating: 4.8,
            image: "🌊",
        },
        {
            id: 3,
            name: "도시공원 순환로",
            distance: "3.1km",
            difficulty: "초급",
            region: "세종시",
            rating: 4.2,
            image: "🌳",
        },
    ];

    const handleFilterChange = (filterType, value) => {
        setFilters((prev) => ({
            ...prev,
            [filterType]: value,
        }));
    };

    const handleCourseClick = (course) => {
        onCourseSelect(course);
        if (window.innerWidth <= 768) {
            onClose();
        }
    };

    return (
        <>
            {isOpen && <div className="sidebar-overlay" onClick={onClose} />}
            <div className={`sidebar ${isOpen ? "open" : ""}`}>
                <div className="sidebar-header">
                    <h2>코스 필터</h2>
                    <button className="close-button" onClick={onClose}>
                        ×
                    </button>
                </div>

                <div className="sidebar-content">
                    <div className="filter-section">
                        <h3>거리</h3>
                        <select
                            value={filters.distance}
                            onChange={(e) =>
                                handleFilterChange("distance", e.target.value)
                            }
                            className="filter-select"
                        >
                            <option value="all">전체</option>
                            <option value="short">3km 이하</option>
                            <option value="medium">3-7km</option>
                            <option value="long">7km 이상</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <h3>난이도</h3>
                        <select
                            value={filters.difficulty}
                            onChange={(e) =>
                                handleFilterChange("difficulty", e.target.value)
                            }
                            className="filter-select"
                        >
                            <option value="all">전체</option>
                            <option value="beginner">초급</option>
                            <option value="intermediate">중급</option>
                            <option value="advanced">고급</option>
                        </select>
                    </div>

                    <div className="filter-section">
                        <h3>지역</h3>
                        <select
                            value={filters.region}
                            onChange={(e) =>
                                handleFilterChange("region", e.target.value)
                            }
                            className="filter-select"
                        >
                            <option value="all">전체</option>
                            <option value="sejong">세종시</option>
                            <option value="daejeon">대전시</option>
                            <option value="cheongju">청주시</option>
                        </select>
                    </div>

                    <div className="courses-section">
                        <h3>추천 코스</h3>
                        <div className="course-list">
                            {sampleCourses.map((course) => (
                                <div
                                    key={course.id}
                                    className="course-card"
                                    onClick={() => handleCourseClick(course)}
                                >
                                    <div className="course-image">
                                        {course.image}
                                    </div>
                                    <div className="course-info">
                                        <h4>{course.name}</h4>
                                        <p className="course-details">
                                            {course.distance} •{" "}
                                            {course.difficulty}
                                        </p>
                                        <div className="course-rating">
                                            ⭐ {course.rating}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </>
    );
};

export default Sidebar;
