import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./CourseDetailModal.css";
import KakaoMap from "../map/KakaoMap";
import { getCourseById, getCourseImages, toggleCourseLike, getCourseLikeStatus } from "../../services/coursesService";
import LoadingScreen from "./loading/LoadingScreen";
import { useUser } from "../../contexts/UserContext";

const CourseDetailModal = ({
    course,
    isOpen,
    onClose,
    onFavorite,
    onViewMap,
}) => {
    const navigate = useNavigate();
    const { currentUserId } = useUser();
    const [courseData, setCourseData] = useState(null);
    const [courseImages, setCourseImages] = useState([]);
    const [currentViewIndex, setCurrentViewIndex] = useState(0); // 0: 지도, 1~: 이미지들
    const [preloadedImages, setPreloadedImages] = useState(new Set());
    const [isLiked, setIsLiked] = useState(false);
    const [likesCount, setLikesCount] = useState(0);
    const [likeLoading, setLikeLoading] = useState(false);

    // 코스 데이터 로드
    useEffect(() => {
        const loadCourseData = async () => {
            if (!course || !course.id || !currentUserId) return;

            // 모달이 열릴 때마다 지도로 초기화
            setCurrentViewIndex(0);

            try {
                const [courseResult, imagesResult, likeStatusResult] = await Promise.all([
                    getCourseById(course.id),
                    getCourseImages(course.id),
                    getCourseLikeStatus(currentUserId, course.id)
                ]);

                if (courseResult.error) {
                    // 코스 데이터 로드 실패
                } else {
                    setCourseData(courseResult.data);
                    setLikesCount(courseResult.data.likesCount || 0);
                }

                if (imagesResult.error) {
                    // 이미지 로드 실패
                } else {
                    setCourseImages(imagesResult.data);
                    // 모든 이미지 프리로드
                    preloadImages(imagesResult.data);
                }

                if (!likeStatusResult.error) {
                    setIsLiked(likeStatusResult.isLiked);
                }
            } catch (err) {
                // 데이터 로드 중 오류
            } finally {
                // setLoading(false); // Removed as per edit hint
            }
        };

        loadCourseData();
    }, [course, currentUserId]);

    // 이미지 프리로드 함수
    const preloadImages = (images) => {
        images.forEach((image) => {
            const img = new Image();
            img.onload = () => {
                setPreloadedImages(prev => new Set([...prev, image.url]));
            };
            img.src = image.url;
        });
    };

    if (!isOpen || !course) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFavoriteClick = async () => {
        if (likeLoading || !currentUserId) return;
        
        setLikeLoading(true);
        
        try {
            const result = await toggleCourseLike(currentUserId, course.id);
            
            if (result.success) {
                setIsLiked(result.isLiked);
                setLikesCount(result.likesCount);
                
                // 부모 컴포넌트에도 변경사항을 알림 (기존 onFavorite 콜백 유지)
                if (onFavorite) {
                    onFavorite(course.id);
                }
            } else {
                console.error('좋아요 토글 실패:', result.error);
            }
        } catch (error) {
            console.error('좋아요 처리 중 오류:', error);
        } finally {
            setLikeLoading(false);
        }
    };

    const handleViewMapClick = () => {
        // MainPage로 이동하면서 선택된 코스 정보를 URL 파라미터로 전달
        navigate(`/courses?selectedCourseId=${course.id}`);
        onClose(); // 모달 닫기
    };

    // 이미지가 이미 프리로드되었는지 확인
    const isImagePreloaded = (imageUrl) => {
        return preloadedImages.has(imageUrl);
    };

    const handlePrevView = () => {
        if (currentViewIndex > 0) {
            setCurrentViewIndex(currentViewIndex - 1);
        }
    };

    const handleNextView = () => {
        if (currentViewIndex < courseImages.length) {
            setCurrentViewIndex(currentViewIndex + 1);
        }
    };

    const handleGoToMap = () => {
        setCurrentViewIndex(0);
    };

    const handleIndicatorClick = (index) => {
        setCurrentViewIndex(index);
    };

    // 실제 GeoJSON 데이터 또는 샘플 데이터 사용
    const getGeoJsonData = () => {
        if (courseData?.geomJson) {
            return courseData.geomJson;
        }
    };

    // 경계 데이터 가져오기
    const getBounds = () => {
        if (
            courseData?.minLatitude &&
            courseData?.maxLatitude &&
            courseData?.minLongitude &&
            courseData?.maxLongitude
        ) {
            return {
                minLat: courseData.minLatitude,
                maxLat: courseData.maxLatitude,
                minLng: courseData.minLongitude,
                maxLng: courseData.maxLongitude,
            };
        }
        return null;
    };

    const totalViews = 1 + courseImages.length; // 지도 + 이미지들
    const currentImage =
        currentViewIndex > 0 ? courseImages[currentViewIndex - 1] : null;

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                {/* 헤더 */}
                <div className="modal-header">
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* 뷰 전환 컨테이너 */}
                <div className="course-detail-modal__view-container">
                    {/* 현재 뷰 표시 */}
                    {currentViewIndex === 0 ? (
                        <div className="course-detail-modal__map-container">
                            <KakaoMap
                                geomJson={getGeoJsonData()}
                                width="100%"
                                height="100%"
                                fitBoundsOnChange={true}
                                boundsPadding={0}
                                controllable={false}
                                bounds={getBounds()}
                                routeStyle={{
                                    strokeWeight: 6,
                                    strokeColor: "#3B82F6",
                                    strokeOpacity: 0.85,
                                    strokeStyle: "solid",
                                }}
                            />
                        </div>
                    ) : (
                        <div className="course-detail-modal__single-image-container">
                            {/* 블러 처리된 배경 이미지 */}
                            <div
                                className="image-background-blur"
                                style={{
                                    backgroundImage: `url(${currentImage?.url})`,
                                }}
                            ></div>

                            {/* 로딩 화면 - 프리로드되지 않은 이미지만 표시 */}
                            {!isImagePreloaded(currentImage?.url) && (
                                <div className="image-loading-overlay">
                                    <LoadingScreen />
                                </div>
                            )}

                            {/* 전체 이미지 */}
                            <img
                                src={currentImage?.url}
                                alt={`코스 이미지 ${currentViewIndex}`}
                                className="course-single-image"
                                style={{
                                    display: isImagePreloaded(currentImage?.url) ? "block" : "none",
                                }}
                            />
                        </div>
                    )}

                    {/* 네비게이션 버튼들 */}
                    {totalViews > 1 && (
                        <>
                            {/* 이전 버튼 */}
                            {currentViewIndex > 0 && (
                                <button
                                    className="view-nav-button view-nav-button--prev"
                                    onClick={handlePrevView}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M15 18L9 12L15 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            )}

                            {/* 다음 버튼 */}
                            {currentViewIndex < courseImages.length && (
                                <button
                                    className="view-nav-button view-nav-button--next"
                                    onClick={handleNextView}
                                >
                                    <svg
                                        width="24"
                                        height="24"
                                        viewBox="0 0 24 24"
                                        fill="none"
                                    >
                                        <path
                                            d="M9 18L15 12L9 6"
                                            stroke="currentColor"
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        />
                                    </svg>
                                </button>
                            )}

                            {/* 인디케이터 */}
                            <div className="view-indicators">
                                <button
                                    className={`view-indicator ${
                                        currentViewIndex === 0 ? "active" : ""
                                    }`}
                                    onClick={handleGoToMap}
                                ></button>
                                {courseImages.map((image, index) => (
                                    <button
                                        key={index}
                                        className={`view-indicator ${
                                            currentViewIndex === index + 1
                                                ? "active"
                                                : ""
                                        }`}
                                        onClick={() =>
                                            handleIndicatorClick(index + 1)
                                        }
                                    ></button>
                                ))}
                            </div>
                        </>
                    )}
                </div>

                {/* 제목 */}
                <div className="modal-title-section">
                    <h2 className="modal-title">{course.title}</h2>
                </div>

                {/* 요약 통계 */}
                <div className="course-summary">
                    <div className="summary-item">
                        <img
                            src="/icons/course.png"
                            alt="거리"
                            className="summary-icon"
                            style={{ width: "16px", height: "16px" }}
                        />
                        <span className="summary-text">
                            {courseData?.distance
                                ? `${courseData.distance}km`
                                : course.distance}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-icon">
                            <img
                                src="/icons/heart_icon.png"
                                alt="좋아요"
                                className="heart-icon"
                            />
                        </span>
                        <span className="summary-text">
                            {likesCount}
                        </span>
                    </div>
                </div>

                {/* 코스 유형 */}
                <div className="course-section">
                    <div className="section-header">
                        <h3 className="section-title">코스 유형</h3>
                    </div>
                    <div className="section-content">
                        <div className="tags-container">
                            {courseData?.tags && courseData.tags.length > 0 ? (
                                courseData.tags.map((tag, index) => (
                                    <span 
                                        key={index} 
                                        className="tag type"
                                    >
                                        {tag}
                                    </span>
                                ))
                            ) : (
                                <span className="tag type">정보 없음</span>
                            )}
                        </div>
                    </div>
                </div>

                {/* 코스 설명 */}
                <div className="course-section">
                    <div className="section-header">
                        <h3 className="section-title">코스 설명</h3>
                    </div>
                    <div className="section-content">
                        <p className="course-description">
                            {courseData?.description || course.description || "코스 설명이 없습니다."}
                        </p>
                    </div>
                </div>

                {/* 작성자 정보 */}
                {/* <div className="course-section">
                    <div className="section-content">
                        <div className="author-info">
                            <span className="author-label">
                                작성자 : 손흥민
                            </span>
                        </div>
                    </div>
                </div> */}

                {/* 하단 버튼 */}
                <div className="modal-actions">
                    <button
                        className="action-button secondary"
                        onClick={handleViewMapClick}
                    >
                        지도에서 보기
                    </button>
                    <button
                        className={`heart-button ${isLiked ? 'liked' : ''}`}
                        onClick={handleFavoriteClick}
                        disabled={likeLoading}
                    >
                        <img
                            src="/icons/heart_icon.png"
                            alt="좋아요"
                            className="heart-icon"
                        />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
