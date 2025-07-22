import React from "react";
import "./RunningCard.css";
import KakaoMap from "./KakaoMap";

const RunningCard = ({
    course,
    onFavorite,
    onViewDetails,
    onPlayVideo,
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
        hasVideo = false,
    } = course;

    const handleFavoriteClick = (e) => {
        e.stopPropagation();
        onFavorite && onFavorite(id);
    };

    const handlePlayVideo = (e) => {
        e.stopPropagation();
        onPlayVideo && onPlayVideo(id);
    };

    const handleViewDetails = () => {
        onViewDetails && onViewDetails(course);
    };

    return (
        <div className="running-card">
            {/* 이미지 섹션 */}
            <div className="card-image-section">
                <div className="image-placeholder">
                    <KakaoMap
                        width="100%"
                        height="100%"
                        gpxUrl="/gpx/route_0.gpx"
                        autoFitBounds={true}
                        boundsPadding={0}
                        onMapLoad={(map) => console.log("맵 로드 완료:", map)}
                        onRouteLoad={(trackPoints) =>
                            console.log(
                                "경로 로드 완료:",
                                trackPoints.length,
                                "포인트"
                            )
                        }
                        onError={(error) => console.error("맵 에러:", error)}
                    />
                </div>

                {/* 좋아요 버튼 */}
                <button
                    className={`favorite-btn ${isFavorite ? "active" : ""}`}
                    onClick={handleFavoriteClick}
                    aria-label="좋아요"
                >
                    ❤️
                </button>

                {/* 비디오 재생 버튼 */}
                {hasVideo && (
                    <button
                        className="play-btn"
                        onClick={handlePlayVideo}
                        aria-label="비디오 재생"
                    >
                        ▶️
                    </button>
                )}
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

export default RunningCard;
