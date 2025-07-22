import React from "react";
import "./CourseCard.css";

const CourseCard = ({
    course,
    onFavorite,
    onViewDetails,
    isFavorite = false,
}) => {
    const {
        id,
        title,
        description,
        distance,
        duration,
        difficulty,
        rating,
        tags = [],
        image,
    } = course;

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onFavorite && onFavorite(id);
    };

    const handleViewDetails = () => {
        onViewDetails && onViewDetails(course);
    };

    return (
        <div className="course-card">
            {/* 이미지 섹션 */}
            <div className="card-image-section">
                <div className="image-placeholder">
                    {image ? (
                        <img src={image} alt={title} className="course-image" />
                    ) : (
                        <div className="image-icon">None</div>
                    )}
                </div>

                {/* 좋아요 버튼 */}
                <button
                    className={`favorite-btn ${isFavorite ? "active" : ""}`}
                    onClick={handleFavoriteClick}
                    aria-label="좋아요"
                >
                    ❤️
                </button>
            </div>

            {/* 콘텐츠 섹션 */}
            <div className="card-content">
                {/* 제목과 평점 */}
                <div className="card-header">
                    <h3 className="course-title">{title}</h3>
                    <div className="course-rating">⭐ {rating}</div>
                </div>

                {/* 설명 */}
                <p className="course-description">{description}</p>

                {/* 코스 정보 */}
                <div className="course-metrics">
                    <div className="metric-item">
                        <span className="metric-icon">📍</span>
                        <span className="metric-value">{distance}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-icon">⏱️</span>
                        <span className="metric-value">{duration}</span>
                    </div>
                    <div className="metric-item">
                        <span className="metric-icon">🏔️</span>
                        <span className="metric-value">{difficulty}</span>
                    </div>
                </div>

                {/* 태그 */}
                {tags.length > 0 && (
                    <div className="course-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="tag">
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}

                {/* 상세보기 버튼 */}
                <button
                    className="view-details-btn"
                    onClick={handleViewDetails}
                >
                    코스 상세보기
                </button>
            </div>
        </div>
    );
};

export default CourseCard;
