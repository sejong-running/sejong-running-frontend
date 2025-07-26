import React, { useState, useEffect } from "react";
import "./RecommendationCard.css";
import { getTagColor } from "../../data/runningTags";
import KakaoMap from "../map/KakaoMap";

const RecommendationCard = ({
    recommendation,
    index,
    onViewDetail,
    onViewMap,
}) => {
    const [mapKey, setMapKey] = useState(0);

    // 컴포넌트 마운트 시 지도 재초기화
    useEffect(() => {
        if (recommendation?.courseInfo?.id) {
            const timer = setTimeout(() => {
                setMapKey((prev) => prev + 1);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [recommendation?.courseInfo?.id]);

    if (!recommendation || !recommendation.courseInfo) {
        return null;
    }

    const { courseInfo, reason, matchScore, matchedTags } = recommendation;

    return (
        <div className="recommendation-card">
            {/* AI 추천 표시 */}
            <div className="ai-badge">
                <span className="ai-text">AI 추천</span>
            </div>

            <div className="card-content">
                {/* 경로 지도 */}
                <div className="course-map-container">
                    {courseInfo.geomJson ? (
                        <KakaoMap
                            key={`map-${courseInfo.id}-${mapKey}`}
                            width="100%"
                            height="180px"
                            geomJson={courseInfo.geomJson}
                            bounds={
                                courseInfo.minLatitude && courseInfo.maxLatitude
                                    ? {
                                          minLat: courseInfo.minLatitude,
                                          maxLat: courseInfo.maxLatitude,
                                          minLng: courseInfo.minLongitude,
                                          maxLng: courseInfo.maxLongitude,
                                      }
                                    : null
                            }
                            center={
                                courseInfo.minLatitude && courseInfo.maxLatitude
                                    ? {
                                          lat:
                                              (courseInfo.minLatitude +
                                                  courseInfo.maxLatitude) /
                                              2,
                                          lng:
                                              (courseInfo.minLongitude +
                                                  courseInfo.maxLongitude) /
                                              2,
                                      }
                                    : null
                            }
                            level={6}
                            fitBoundsOnChange={true}
                            controllable={false}
                            boundsPadding={2}
                            routeStyle={{
                                strokeWeight: 5,
                                strokeColor: "#FF6B6B",
                                strokeOpacity: 0.8,
                                strokeStyle: "solid",
                            }}
                            onMapLoad={(map) => {
                                // console.log("RecommendationCard 맵 로드 완료:", map);
                            }}
                            onError={(error) =>
                                console.error(
                                    "RecommendationCard 맵 에러:",
                                    error
                                )
                            }
                        />
                    ) : (
                        <div className="map-placeholder">
                            <span>🗺️</span>
                            <p>지도 정보가 없습니다</p>
                        </div>
                    )}
                </div>

                {/* 코스 정보 */}
                <h3 className="card-title">{courseInfo.title}</h3>
                <p className="card-description">{courseInfo.description}</p>

                {/* AI 추천 이유 */}
                <div className="recommendation-reason">
                    <p className="reason-text">{reason}</p>
                </div>

                {/* 매칭된 태그들 */}
                {matchedTags && matchedTags.length > 0 && (
                    <div className="matched-tags">
                        <h5 className="tags-title">🏷️ 매칭된 태그</h5>
                        <div className="tags-list">
                            {matchedTags.map((tag, tagIndex) => (
                                <span
                                    key={tagIndex}
                                    className="matched-tag"
                                    style={{
                                        backgroundColor: getTagColor(tag),
                                    }}
                                >
                                    {tag}
                                </span>
                            ))}
                        </div>
                    </div>
                )}

                {/* 코스 기본 정보 */}
                <div className="card-info">
                    <div className="info-row">
                        <span className="info-item">
                            📏 {courseInfo.distance}km
                        </span>
                        <span className="info-item">
                            ❤️ {courseInfo.likesCount}
                        </span>
                    </div>
                    <div className="info-row">
                        <span className="info-item">
                            👤 {courseInfo.creatorName}
                        </span>
                    </div>
                </div>

                {/* 액션 버튼들 */}
                <div className="card-actions">
                    <button
                        className="action-btn primary"
                        onClick={() => onViewMap(courseInfo)}
                    >
                        지도에서 보기
                    </button>
                    <button
                        className="action-btn secondary"
                        onClick={() => onViewDetail(courseInfo)}
                    >
                        상세 정보
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
