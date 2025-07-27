import React, { useState, useEffect } from "react";
import "./CourseDetailModal.css";
import KakaoMap from "../map/KakaoMap";
import { getCourseById } from "../../services/coursesService";

const CourseDetailModal = ({
    course,
    isOpen,
    onClose,
    onFavorite,
    onViewMap,
}) => {
    const [courseData, setCourseData] = useState(null);
    const [loading, setLoading] = useState(false);

    // 코스 데이터 로드
    useEffect(() => {
        const loadCourseData = async () => {
            if (!course || !course.id) return;

            setLoading(true);
            try {
                const { data, error } = await getCourseById(course.id);
                if (error) {
                    console.error("코스 데이터 로드 실패:", error);
                } else {
                    setCourseData(data);
                }
            } catch (err) {
                console.error("코스 데이터 로드 중 오류:", err);
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

                {/* 지도 */}
                <div className="course-detail-modal__image">
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
                                strokeColor: "#3B82F6", // 눈에 덜 자극적인 블루 계열
                                strokeOpacity: 0.85,
                                strokeStyle: "solid",
                            }}
                        />
                    </div>
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
