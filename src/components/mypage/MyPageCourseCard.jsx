import React, { useState, useEffect } from "react";
import "./MyPageCourseCard.css";
import KakaoMap from "../map/KakaoMap";

const RunningCard = ({ course, onViewDetails }) => {
    const {
        id,
        title,
        description,
        distance,
        duration,
        difficulty,
        tags = [],
    } = course;

    const [mapKey, setMapKey] = useState(0);

    // 컴포넌트 마운트 시 지도 재초기화
    useEffect(() => {
        const timer = setTimeout(() => {
            setMapKey((prev) => prev + 1);
        }, 100);
        return () => clearTimeout(timer);
    }, [course.id]); // geomJson 대신 course.id 사용

    const handleViewDetails = () => {
        onViewDetails && onViewDetails(course);
    };

    return (
        <div className="running-card">
            {/* 이미지 섹션 */}
            <div className="card-image-section">
                <div className="image-placeholder">
                    {course.geomJson ? (
                        <KakaoMap
                            key={`map-${id}-${mapKey}`}
                            width="100%"
                            height="100%"
                            geomJson={course.geomJson}
                            bounds={
                                course.minLatitude && course.maxLatitude
                                    ? {
                                          minLat: course.minLatitude,
                                          maxLat: course.maxLatitude,
                                          minLng: course.minLongitude,
                                          maxLng: course.maxLongitude,
                                      }
                                    : null
                            }
                            center={
                                course.minLatitude && course.maxLatitude
                                    ? {
                                          lat:
                                              (course.minLatitude +
                                                  course.maxLatitude) /
                                              2,
                                          lng:
                                              (course.minLongitude +
                                                  course.maxLongitude) /
                                              2,
                                      }
                                    : null
                            }
                            level={6}
                            fitBoundsOnChange={true}
                            controllable={false}
                            boundsPadding={1}
                            routeStyle={{
                                strokeWeight: 5,
                                strokeColor: "#FF6B6B",
                                strokeOpacity: 0.8,
                                strokeStyle: "solid",
                            }}
                            onMapLoad={(map) => {
                                // console.log("RunningCard 맵 로드 완료:", map);
                                // console.log("Course bounds:", {
                                //     minLat: course.minLatitude,
                                //     maxLat: course.maxLatitude,
                                //     minLng: course.minLongitude,
                                //     maxLng: course.maxLongitude,
                                // });
                            }}
                            onError={(error) =>
                                console.error("RunningCard 맵 에러:", error)
                            }
                        />
                    ) : (
                        <div className="map-placeholder">
                            <span>🗺️</span>
                            <p>지도 정보가 없습니다</p>
                            <small
                                style={{ fontSize: "12px", marginTop: "4px" }}
                            >
                                Debug: geomJson ={" "}
                                {course.geomJson ? "exists" : "null"}
                            </small>
                        </div>
                    )}
                </div>
            </div>

            {/* 콘텐츠 섹션 */}
            <div className="card-content">
                {/* 제목 */}
                <div className="card-header">
                    <h3 className="mypage-course-card-title">{title}</h3>
                </div>

                {/* 설명 */}
                <p className="course-description">{description}</p>

                {/* 코스 정보 */}
                <div className="course-metrics">
                    <div className="metric-item">
                        <img src="/icons/course.png" alt="거리" className="metric-icon" style={{width: '16px', height: '16px'}} />
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
                    <div className="mypage-course-card-tags">
                        {tags.map((tag, index) => (
                            <span key={index} className="mypage-course-card-tag">
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
