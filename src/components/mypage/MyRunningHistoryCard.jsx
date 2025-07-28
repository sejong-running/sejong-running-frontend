import React from "react";
import "./MyRunningHistoryCard.css";

const MyRunningHistoryCard = ({ course, onViewDetails }) => {
    const {
        title,
        actualDistance,
        actualDuration,
        actualPace,
        completedAt,
        personalBest,
    } = course;

    const handleViewDetails = () => {
        onViewDetails && onViewDetails(course);
    };

    const formatDate = (dateString) => {
        const date = new Date(dateString);
        const year = date.getFullYear();
        const month = date.getMonth() + 1;
        const day = date.getDate();
        const hours = date.getHours().toString().padStart(2, "0");
        const minutes = date.getMinutes().toString().padStart(2, "0");

        return `${year}년 ${month}월 ${day}일 ${hours}:${minutes}`;
    };

    const formatTime = (seconds) => {
        if (!seconds || seconds === 0) return "";

        const totalSeconds = Math.floor(seconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
        } else if (minutes > 0) {
            return `${minutes}분 ${remainingSeconds}초`;
        } else {
            return `${remainingSeconds}초`;
        }
    };

    const formatPace = (paceSeconds) => {
        if (!paceSeconds || paceSeconds === 0) return "";

        const totalSeconds = Math.floor(paceSeconds);
        const hours = Math.floor(totalSeconds / 3600);
        const minutes = Math.floor((totalSeconds % 3600) / 60);
        const remainingSeconds = totalSeconds % 60;

        if (hours > 0) {
            return `${hours}시간 ${minutes}분 ${remainingSeconds}초`;
        } else if (minutes > 0) {
            return `${minutes}분 ${remainingSeconds}초`;
        } else {
            return `${remainingSeconds}초`;
        }
    };

    return (
        <div className="toss-running-card">
            {/* 헤더 */}
            <div className="card-header">
                <div className="course-info">
                    <h3 className="course-title">{title}</h3>
                    <span className="completion-date">
                        {formatDate(completedAt)}
                    </span>
                </div>
                {personalBest && (
                    <div className="best-badge">
                        <span className="best-icon">🏆</span>
                    </div>
                )}
            </div>

            {/* 기록 정보 */}
            <div className="record-section">
                <div className="record-grid">
                    <div className="record-item">
                        <div className="record-value">{actualDistance}km</div>
                        <div className="record-label">거리</div>
                    </div>
                    <div className="record-item">
                        <div className="record-value">
                            {formatTime(actualDuration)}
                        </div>
                        <div className="record-label">시간</div>
                    </div>
                    {actualPace && (
                        <div className="record-item">
                            <div className="record-value">
                                {formatPace(actualPace)}
                            </div>
                            <div className="record-label">km당 페이스</div>
                        </div>
                    )}
                </div>
            </div>

            {/* 액션 버튼 */}
            <button className="detail-button" onClick={handleViewDetails}>
                코스 상세보기
            </button>
        </div>
    );
};

export default MyRunningHistoryCard;
