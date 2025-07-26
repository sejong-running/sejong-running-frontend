import React, { useState, useEffect } from "react";
import "./RunPage.css";
import Header from "../components/shared/Header";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import { getAllCourses } from "../services";

const RunPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalCourse, setModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);

    // 코스 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const coursesResult = await getAllCourses();

                if (coursesResult.error) {
                    setError(coursesResult.error);
                } else {
                    setAllCourses(coursesResult.data);
                    // 임의로 3개 코스 추천
                    const shuffled = [...coursesResult.data].sort(() => 0.5 - Math.random());
                    setRecommendedCourses(shuffled.slice(0, 3));
                }
            } catch (err) {
                setError("데이터를 불러오는데 실패했습니다.");
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);


    const handleViewDetail = (course) => {
        setModalCourse(course);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setModalCourse(null);
    };

    const handleModalViewMap = (course) => {
        setIsModalOpen(false);
        // 지도 페이지로 리다이렉트 할 수 있음
        window.location.href = `/courses`;
    };

    const handleRefreshRecommendations = () => {
        if (allCourses.length > 0) {
            const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
            setRecommendedCourses(shuffled.slice(0, 3));
        }
    };

    return (
        <div className="run-page-container">
            <Header />
            <div className="run-page">
                <div className="page-header">
                    <h1>오늘의 추천 코스</h1>
                    <button 
                        className="refresh-btn"
                        onClick={handleRefreshRecommendations}
                        disabled={loading}
                    >
                        🔄 새로 추천받기
                    </button>
                </div>
                
                {loading ? (
                    <div className="loading-state">
                        <p>추천 코스를 불러오고 있습니다...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>오류: {error}</p>
                        <button onClick={() => window.location.reload()}>
                            다시 시도
                        </button>
                    </div>
                ) : (
                    <div className="cards-container">
                        {recommendedCourses.map((course, index) => (
                            <div
                                key={course.id}
                                className="recommendation-card"
                            >
                                <div className="card-rank">#{index + 1}</div>
                                <div className="card-content">
                                    <h3 className="card-title">{course.title}</h3>
                                    <p className="card-description">{course.description}</p>
                                    
                                    <div className="card-info">
                                        <div className="info-row">
                                            <span className="info-item">
                                                📏 {course.distance}km
                                            </span>
                                            <span className="info-item">
                                                ❤️ {course.likesCount}
                                            </span>
                                        </div>
                                        <div className="info-row">
                                            <span className="info-item">
                                                👤 {course.creatorName}
                                            </span>
                                        </div>
                                    </div>

                                    {course.tags && course.tags.length > 0 && (
                                        <div className="card-tags">
                                            {course.tags.slice(0, 2).map((tag, tagIndex) => (
                                                <span key={tagIndex} className="tag">
                                                    {tag}
                                                </span>
                                            ))}
                                        </div>
                                    )}

                                    <div className="card-actions">
                                        <button
                                            className="action-btn primary"
                                            onClick={() => window.location.href = '/courses'}
                                        >
                                            지도에서 보기
                                        </button>
                                        <button
                                            className="action-btn secondary"
                                            onClick={() => handleViewDetail(course)}
                                        >
                                            상세 정보
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            <CourseDetailModal
                course={modalCourse}
                isOpen={isModalOpen}
                onClose={handleCloseModal}
                onViewMap={handleModalViewMap}
            />
        </div>
    );
};

export default RunPage;