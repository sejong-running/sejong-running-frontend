import React, { useState, useEffect } from "react";
import { useDispatch } from "react-redux";
import { openModal } from "../../store/modalSlice";
import styles from "./RecommendationCard.module.css";
import { getTagColor } from "../../data/runningTags";
import KakaoMap from "../map/KakaoMap";
import { useUser } from "../../contexts/UserContext";
import {
    toggleCourseLike,
    getCourseLikeStatus,
} from "../../services/coursesService";

const RecommendationCard = ({ recommendation, index, onLike }) => {
    const dispatch = useDispatch();
    const [mapKey, setMapKey] = useState(0);
    const [isLiked, setIsLiked] = useState(false);
    const [isLikeLoading, setIsLikeLoading] = useState(false);
    const { currentUserId } = useUser();

    // 컴포넌트 마운트 시 지도 재초기화
    useEffect(() => {
        if (recommendation?.courseInfo?.id) {
            const timer = setTimeout(() => {
                setMapKey((prev) => prev + 1);
            }, 100);
            return () => clearTimeout(timer);
        }
    }, [recommendation?.courseInfo?.id]);

    // 좋아요 상태 초기화
    useEffect(() => {
        const checkLikeStatus = async () => {
            if (currentUserId && recommendation?.courseInfo?.id) {
                try {
                    const { isLiked: likedStatus } = await getCourseLikeStatus(
                        currentUserId,
                        recommendation.courseInfo.id
                    );
                    setIsLiked(likedStatus);
                } catch (error) {
                    console.error("좋아요 상태 확인 실패:", error);
                }
            }
        };

        checkLikeStatus();
    }, [currentUserId, recommendation?.courseInfo?.id]);

    // 좋아요 토글 함수
    const handleLikeToggle = async (e) => {
        e.stopPropagation();

        if (!currentUserId) {
            alert("로그인이 필요합니다.");
            return;
        }

        if (isLikeLoading) return;

        setIsLikeLoading(true);
        try {
            const result = await toggleCourseLike(
                currentUserId,
                recommendation.courseInfo.id
            );

            if (result.success) {
                setIsLiked(result.isLiked);
                // 부모 컴포넌트에 좋아요 상태 변경 알림
                if (onLike) {
                    onLike(recommendation.courseInfo.id, result.isLiked);
                }
            } else {
                alert("좋아요 처리 중 오류가 발생했습니다.");
            }
        } catch (error) {
            console.error("좋아요 토글 실패:", error);
            alert("좋아요 처리 중 오류가 발생했습니다.");
        } finally {
            setIsLikeLoading(false);
        }
    };

    if (!recommendation || !recommendation.courseInfo) {
        return null;
    }

    const { courseInfo, reason, matchScore, matchedTags } = recommendation;

    return (
        <div className={styles["recommendation-card"]}>
            {/* AI 추천 표시 */}
            <div className={styles["recommendation-card__ai-badge"]}>
                <span>AI 추천</span>
            </div>

            <div className={styles["recommendation-card__content"]}>
                {/* 경로 지도 */}
                <div className={styles["recommendation-card__map-container"]}>
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
                        <div
                            className={
                                styles["recommendation-card__map-placeholder"]
                            }
                        >
                            <span>🗺️</span>
                            <p>지도 정보가 없습니다</p>
                        </div>
                    )}
                </div>

                {/* 코스 제목 */}
                <div className={styles["recommendation-card__title"]}>
                    {courseInfo.title.includes(":") ? (
                        <>
                            <div
                                className={
                                    styles["recommendation-card__title-main"]
                                }
                            >
                                {courseInfo.title.split(":")[0].trim()}
                            </div>
                            <div
                                className={
                                    styles["recommendation-card__title-sub"]
                                }
                            >
                                {courseInfo.title.split(":")[1].trim()}
                            </div>
                        </>
                    ) : (
                        <div
                            className={
                                styles["recommendation-card__title-main"]
                            }
                        >
                            {courseInfo.title}
                        </div>
                    )}
                </div>

                {/* AI 추천 이유 */}
                <div className={styles["recommendation-card__reason"]}>
                    <p className={styles["recommendation-card__reason-text"]}>
                        "{reason}"
                    </p>
                </div>

                {/* 매칭된 태그들 */}
                {matchedTags && matchedTags.length > 0 && (
                    <div className={styles["recommendation-card__tags"]}>
                        <div
                            className={styles["recommendation-card__tags-list"]}
                        >
                            {matchedTags.map((tag, tagIndex) => (
                                <span
                                    key={tagIndex}
                                    className={
                                        styles["recommendation-card__tag"]
                                    }
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
                <div className={styles["recommendation-card__info"]}>
                    <div className={styles["recommendation-card__distance"]}>
                        {courseInfo.distance}km
                    </div>
                </div>

                {/* 액션 버튼들 */}
                <div className={styles["recommendation-card__actions"]}>
                    <button
                        className={`${styles["recommendation-card__button"]} ${styles["recommendation-card__button--primary"]}`}
                        onClick={() => {
                            console.log("상세정보 버튼 클릭:", courseInfo);
                            dispatch(openModal(courseInfo));
                        }}
                    >
                        상세정보
                    </button>
                    <button
                        className={`${
                            styles["recommendation-card__heart-button"]
                        } ${isLiked ? styles["liked"] : ""}`}
                        onClick={handleLikeToggle}
                        disabled={isLikeLoading}
                        title={
                            isLikeLoading
                                ? "처리중..."
                                : isLiked
                                ? "좋아요 취소"
                                : "좋아요"
                        }
                    >
                        <img
                            src="/icons/heart_icon.png"
                            alt="좋아요"
                            className={
                                styles["recommendation-card__heart-icon"]
                            }
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default RecommendationCard;
