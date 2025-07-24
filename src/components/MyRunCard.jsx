import React from "react";
import "./MyRunCard.css";

const MyRunCard = ({ course, onViewDetails }) => {
    const {
        id,
        title,
        description,
        distance,
        duration,
        difficulty,
        rating,
        tags = [],
        completedAt,
        actualDistance,
        actualDuration,
        personalBest,
    } = course;

    const handleViewDetails = () => {
        onViewDetails && onViewDetails(course);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        return date.toLocaleDateString("ko-KR", {
            year: "numeric",
            month: "long",
            day: "numeric",
        });
    };

    return (
        <div className="my-run-card">
            {/* 헤더 섹션 */}
            <div className="card-header">
                <div className="header-left">
                    <h3 className="course-title">{title}</h3>
                    <div className="completion-date">
                        완료일: {formatDate(completedAt)}
                    </div>
                </div>
                <div className="header-right">
                    <div className="course-rating">⭐ {rating}</div>
                </div>
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

            {/* 실제 기록 정보 */}
            <div className="actual-record">
                <h4 className="record-title">🏃‍♂️ 내 기록</h4>
                <div className="record-metrics">
                    <div className="record-item">
                        <span className="record-label">실제 거리:</span>
                        <span className="record-value">{actualDistance}</span>
                    </div>
                    <div className="record-item">
                        <span className="record-label">실제 시간:</span>
                        <span className="record-value">{actualDuration}</span>
                    </div>
                    {personalBest && (
                        <div className="personal-best-badge">
                            🏆 개인 최고 기록
                        </div>
                    )}
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
            <button className="view-details-btn" onClick={handleViewDetails}>
                코스 상세보기
            </button>
        </div>
    );
};

export default MyRunCard;
