import React, { useState, useEffect } from "react";
import "./CourseDetailModal.css";
import KakaoMap from "../map/KakaoMap";
import LoadingScreen from "./LoadingScreen";
import { getCourseById, getCourseImages } from "../../services/coursesService";

const CourseDetailModal = ({
    course,
    isOpen,
    onClose,
    onFavorite,
    onViewMap,
}) => {
    const [courseData, setCourseData] = useState(null);
    const [courseImages, setCourseImages] = useState([]);
    const [currentViewIndex, setCurrentViewIndex] = useState(0); // 0: 지도, 1~: 이미지들
    const [imageLoading, setImageLoading] = useState(true);

    // 코스 데이터 로드
    useEffect(() => {
        const loadCourseData = async () => {
            if (!course || !course.id) return;

            // 모달이 열릴 때마다 지도로 초기화
            setCurrentViewIndex(0);

            try {
                const [courseResult, imagesResult] = await Promise.all([
                    getCourseById(course.id),
                    getCourseImages(course.id),
                ]);

                if (courseResult.error) {
                    // 코스 데이터 로드 실패
                } else {
                    setCourseData(courseResult.data);
                }

                if (imagesResult.error) {
                    // 이미지 로드 실패
                } else {
                    setCourseImages(imagesResult.data);
                }
            } catch (err) {
                // 데이터 로드 중 오류
            } finally {
                // setLoading(false); // Removed as per edit hint
            }
        };

        loadCourseData();
    }, [course]);

    if (!isOpen || !course) return null;

    const handleOverlayClick = (e) => {
        if (e.target === e.currentTarget) {
            onClose();
        }
    };

    const handleFavoriteClick = () => {
        onFavorite(course.id);
    };

    const handleViewMapClick = () => {
        onViewMap(course);
    };

    const handleImageLoad = () => {
        setImageLoading(false);
    };

    const handleImageError = () => {
        setImageLoading(false);
    };

    const handlePrevView = () => {
        if (currentViewIndex > 0) {
            // setSlideDirection("right"); // Removed as per edit hint
            setCurrentViewIndex(currentViewIndex - 1);
            setImageLoading(true);
        }
    };

    const handleNextView = () => {
        if (currentViewIndex < courseImages.length) {
            // setSlideDirection("left"); // Removed as per edit hint
            setCurrentViewIndex(currentViewIndex + 1);
            setImageLoading(true);
        }
    };

    const handleGoToMap = () => {
        // setSlideDirection("right"); // Removed as per edit hint
        setCurrentViewIndex(0);
    };

    const handleIndicatorClick = (index) => {
        if (index < currentViewIndex) {
            // setSlideDirection("right"); // Removed as per edit hint
        } else {
            // setSlideDirection("left"); // Removed as per edit hint
        }
        setCurrentViewIndex(index);
        setImageLoading(true);
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

                            {/* 로딩 화면 */}
                            {imageLoading && (
                                <div className="image-loading-overlay">
                                    <LoadingScreen />
                                </div>
                            )}

                            {/* 전체 이미지 */}
                            <img
                                src={currentImage?.url}
                                alt={`코스 이미지 ${currentViewIndex}`}
                                className={`course-single-image ${
                                    imageLoading ? "loading" : ""
                                }`}
                                onLoad={handleImageLoad}
                                onError={handleImageError}
                                style={{
                                    display: imageLoading ? "none" : "block",
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
                        <span className="summary-icon">📍</span>
                        <span className="summary-text">
                            {courseData?.distance
                                ? `${courseData.distance}km`
                                : course.distance}
                        </span>
                    </div>
                    <div className="summary-item">
                        <span className="summary-icon">❤️</span>
                        <span className="summary-text">
                            {courseData?.likes_count || course.likes || "0"}
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
                            <span className="tag type primary">트랙</span>
                            <span className="tag type secondary">도심</span>
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
                            {course.description ||
                                "세종시민체육관 내부에 위치한 400m 표준 트랙으로, 초보자부터 전문 러너까지 모두 이용할 수 있는 안전하고 쾌적한 러닝 환경을 제공합니다. 고무 재질의 트랙으로 무릎에 부담이 적으며, 야간에도 조명이 잘 되어 있어 안전한 러닝이 가능합니다."}
                        </p>
                    </div>
                </div>

                {/* 작성자 정보 */}
                <div className="course-section">
                    <div className="section-content">
                        <div className="author-info">
                            <span className="author-label">
                                작성자 : 손흥민
                            </span>
                        </div>
                    </div>
                </div>

                {/* 하단 버튼 */}
                <div className="modal-actions">
                    <button
                        className="action-button primary"
                        onClick={handleFavoriteClick}
                    >
                        ❤️ 좋아요
                    </button>
                    <button
                        className="action-button secondary"
                        onClick={handleViewMapClick}
                    >
                        📍 지도에서 보기
                    </button>
                </div>
            </div>
        </div>
    );
};

export default CourseDetailModal;
