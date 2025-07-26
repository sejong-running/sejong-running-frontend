import React, { useState, useEffect } from "react";
import "./RunPage.css";
import Header from "../components/shared/Header";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import SimpleTagSelector from "../components/shared/SimpleTagSelector";
import { getAllCourses } from "../services";
import { getTagColor } from "../data/runningTags";

const RunPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalCourse, setModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);

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
                    const shuffled = [...coursesResult.data].sort(
                        () => 0.5 - Math.random()
                    );
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

    // 태그 선택 변경 핸들러
    const handleTagSelectionChange = (tags) => {
        setSelectedTags(tags);
        console.log("선택된 태그들:", tags);
    };

    // 태그 기반 추천
    const handleGetRecommendations = () => {
        if (selectedTags.length === 0) {
            alert("추천받으려면 최소 하나의 태그를 선택해주세요!");
            return;
        }

        if (allCourses.length > 0) {
            // 현재는 랜덤 추천, 나중에 태그 기반 필터링 로직 추가 가능
            const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
            setRecommendedCourses(shuffled.slice(0, 3));
            setShowRecommendations(true);

            console.log("🎯 선택된 태그들:", selectedTags);
            console.log("📋 추천된 코스들:", shuffled.slice(0, 3));
        }
    };

    // 랜덤 추천 (태그 선택 없이)
    const handleRandomRecommendations = () => {
        if (allCourses.length > 0) {
            const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
            setRecommendedCourses(shuffled.slice(0, 3));
            setShowRecommendations(true);
        }
    };

    // 처음부터 다시
    const handleReset = () => {
        setSelectedTags([]);
        setShowRecommendations(false);
        setRecommendedCourses([]);
    };

    return (
        <div className="run-page-container">
            <Header />
            <div className="run-page">
                <div className="page-header">
                    <h1>🏃‍♂️ 태그 기반 코스 추천</h1>
                    <div className="header-buttons">
                        {!showRecommendations ? (
                            <>
                                <button
                                    className="refresh-btn"
                                    onClick={handleGetRecommendations}
                                    disabled={
                                        loading || selectedTags.length === 0
                                    }
                                >
                                    🎯 태그 기반 추천
                                </button>
                                <button
                                    className="random-btn"
                                    onClick={handleRandomRecommendations}
                                    disabled={loading}
                                >
                                    🎲 랜덤 추천
                                </button>
                            </>
                        ) : (
                            <>
                                <button
                                    className="refresh-btn"
                                    onClick={handleGetRecommendations}
                                    disabled={selectedTags.length === 0}
                                >
                                    🎯 다시 추천받기
                                </button>
                                <button
                                    className="reset-btn"
                                    onClick={handleReset}
                                >
                                    🔄 처음부터
                                </button>
                            </>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="loading-state">
                        <p>코스 데이터를 불러오고 있습니다...</p>
                    </div>
                ) : error ? (
                    <div className="error-state">
                        <p>오류: {error}</p>
                        <button onClick={() => window.location.reload()}>
                            다시 시도
                        </button>
                    </div>
                ) : (
                    <div className="content-container">
                        {!showRecommendations ? (
                            <SimpleTagSelector
                                onSelectionChange={handleTagSelectionChange}
                                selectedTags={selectedTags}
                            />
                        ) : (
                            <div className="recommendations-section">
                                <div className="recommendations-header">
                                    <h2>📋 추천 결과</h2>
                                    {selectedTags.length > 0 && (
                                        <div className="selected-preferences">
                                            <h3>선택된 태그:</h3>
                                            <div className="preference-tags">
                                                {selectedTags.map((tag) => (
                                                    <span
                                                        key={tag}
                                                        className="preference-tag"
                                                        style={{
                                                            backgroundColor:
                                                                getTagColor(
                                                                    tag
                                                                ),
                                                        }}
                                                    >
                                                        {tag}
                                                    </span>
                                                ))}
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className="cards-container">
                                    {recommendedCourses.map((course, index) => (
                                        <div
                                            key={course.id}
                                            className="recommendation-card"
                                        >
                                            <div className="card-rank">
                                                #{index + 1}
                                            </div>
                                            <div className="card-content">
                                                <h3 className="card-title">
                                                    {course.title}
                                                </h3>
                                                <p className="card-description">
                                                    {course.description}
                                                </p>

                                                <div className="card-info">
                                                    <div className="info-row">
                                                        <span className="info-item">
                                                            📏 {course.distance}
                                                            km
                                                        </span>
                                                        <span className="info-item">
                                                            ❤️{" "}
                                                            {course.likesCount}
                                                        </span>
                                                    </div>
                                                    <div className="info-row">
                                                        <span className="info-item">
                                                            👤{" "}
                                                            {course.creatorName}
                                                        </span>
                                                    </div>
                                                </div>

                                                {course.tags &&
                                                    course.tags.length > 0 && (
                                                        <div className="card-tags">
                                                            {course.tags
                                                                .slice(0, 2)
                                                                .map(
                                                                    (
                                                                        tag,
                                                                        tagIndex
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                tagIndex
                                                                            }
                                                                            className="tag"
                                                                        >
                                                                            {
                                                                                tag
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                        </div>
                                                    )}

                                                <div className="card-actions">
                                                    <button
                                                        className="action-btn primary"
                                                        onClick={() =>
                                                            (window.location.href =
                                                                "/courses")
                                                        }
                                                    >
                                                        지도에서 보기
                                                    </button>
                                                    <button
                                                        className="action-btn secondary"
                                                        onClick={() =>
                                                            handleViewDetail(
                                                                course
                                                            )
                                                        }
                                                    >
                                                        상세 정보
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}
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
