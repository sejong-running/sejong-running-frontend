import React, { useState, useEffect } from "react";
import "./CourseDetailModal.css";
import KakaoMap from "../map/KakaoMap";
import ImageSlider from "./ImageSlider";
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
    const [loading, setLoading] = useState(false);
    const [activeTab, setActiveTab] = useState("map"); // 'map' 또는 'images'
    const [showImageSlider, setShowImageSlider] = useState(false);

    // 코스 데이터 로드
    useEffect(() => {
        const loadCourseData = async () => {
            if (!course || !course.id) return;

            console.log("🚀 코스 데이터 로드 시작:", course.id);
            setLoading(true);
            try {
                const [courseResult, imagesResult] = await Promise.all([
                    getCourseById(course.id),
                    getCourseImages(course.id),
                ]);

                console.log("📊 코스 데이터 결과:", courseResult);
                console.log("🖼️ 이미지 데이터 결과:", imagesResult);

                if (courseResult.error) {
                    console.error("코스 데이터 로드 실패:", courseResult.error);
                } else {
                    setCourseData(courseResult.data);
                }

                if (imagesResult.error) {
                    console.error("이미지 로드 실패:", imagesResult.error);
                } else {
                    console.log("✅ 이미지 설정 완료:", imagesResult.data);
                    setCourseImages(imagesResult.data);
                }
            } catch (err) {
                console.error("데이터 로드 중 오류:", err);
            } finally {
                setLoading(false);
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

    const handleImageClick = () => {
        if (courseImages.length > 0) {
            setShowImageSlider(true);
        }
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

    return (
        <div className="modal-overlay" onClick={handleOverlayClick}>
            <div className="modal-content">
                {/* 헤더 */}
                <div className="modal-header">
                    <button className="modal-close" onClick={onClose}>
                        ✕
                    </button>
                </div>

                {/* 탭 네비게이션 */}
                <div className="modal-tabs">
                    <button
                        className={`modal-tab ${
                            activeTab === "map" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("map")}
                    >
                        🗺️ 지도
                    </button>
                    <button
                        className={`modal-tab ${
                            activeTab === "images" ? "active" : ""
                        }`}
                        onClick={() => setActiveTab("images")}
                    >
                        📸 이미지 ({courseImages.length})
                    </button>
                </div>

                {/* 디버깅 정보 */}
                {process.env.NODE_ENV === "development" && (
                    <div
                        style={{
                            padding: "0.5rem 1.5rem",
                            fontSize: "0.75rem",
                            color: "#666",
                        }}
                    >
                        <div>코스 ID: {course?.id}</div>
                        <div>이미지 개수: {courseImages.length}</div>
                        <div>
                            이미지 데이터:{" "}
                            {JSON.stringify(courseImages.slice(0, 2))}
                        </div>
                    </div>
                )}

                {/* 지도 또는 이미지 섹션 */}
                <div className="course-detail-modal__image">
                    {activeTab === "map" ? (
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
                        <div className="course-detail-modal__images-container">
                            {courseImages.length > 0 ? (
                                <div className="course-images-grid">
                                    {courseImages
                                        .slice(0, 4)
                                        .map((image, index) => (
                                            <div
                                                key={index}
                                                className="course-image-item"
                                                onClick={handleImageClick}
                                            >
                                                <img
                                                    src={image.url}
                                                    alt={`코스 이미지 ${
                                                        index + 1
                                                    }`}
                                                    className="course-image"
                                                />
                                                {index === 3 &&
                                                    courseImages.length > 4 && (
                                                        <div className="image-overlay">
                                                            <span>
                                                                +
                                                                {courseImages.length -
                                                                    4}
                                                            </span>
                                                        </div>
                                                    )}
                                            </div>
                                        ))}
                                </div>
                            ) : (
                                <div className="no-images">
                                    <p>이미지가 없습니다.</p>
                                </div>
                            )}
                        </div>
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

            {/* 이미지 슬라이더 모달 */}
            {showImageSlider && (
                <div className="image-slider-modal">
                    <ImageSlider
                        images={courseImages}
                        onClose={() => setShowImageSlider(false)}
                    />
                </div>
            )}
        </div>
    );
};

export default CourseDetailModal;
