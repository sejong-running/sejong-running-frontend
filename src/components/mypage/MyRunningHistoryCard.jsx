import React from "react";
import "./MyRunningHistoryCard.css";

const MyRunningHistoryCard = ({ course, onViewDetails }) => {
    const {
        title,
        description,
        distance,
        duration,
        difficulty,
        tags = [],
        completedAt,
        actualDistance,
        actualDuration,
        actualPace,
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
        <div className="my-running-history-card">
            {/* 헤더 섹션 */}
            <div className="card-header">
                <div>
                    <h3 className="course-title">{title}</h3>
                </div>
                <div className="card-header-right"></div>
            </div>
            <div className="completion-date">
                완료일: {formatDate(completedAt)}
            </div>

            {/* 실제 기록 정보 */}
            <div className="actual-record">
                <h4 className="record-title">
                    <img src="/icons/run.png" alt="running" style={{width: '18px', height: '18px', marginRight: '6px'}} />
                    내 기록
                </h4>
                <div className="record-metrics">
                    <div className="record-item">
                        <span className="record-label">실제 거리:</span>
                        <span className="record-value">{actualDistance}</span>
                    </div>
                    <div className="record-item">
                        <span className="record-label">실제 시간:</span>
                        <span className="record-value">{actualDuration}</span>
                    </div>
                    {actualPace && (
                        <div className="record-item">
                            <span className="record-label">페이스:</span>
                            <span className="record-value">{actualPace}</span>
                        </div>
                    )}
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

export default MyRunningHistoryCard;
