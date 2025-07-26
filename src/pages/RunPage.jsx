import React, { useState, useEffect } from "react";
import Header from "../components/shared/Header";
import SimpleTagSelector from "../components/shared/SimpleTagSelector";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import LoadingScreen from "../components/shared/LoadingScreen";
import { getAllCourses } from "../services/coursesService";
import { getGeminiCourseRecommendations } from "../services/geminiRecommendationService";
import { getTagColor } from "../data/runningTags";
import "./RunPage.css";

const RunPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [selectedTags, setSelectedTags] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [selectedCourse, setSelectedCourse] = useState(null);
    const [showModal, setShowModal] = useState(false);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [geminiRecommendations, setGeminiRecommendations] = useState(null);
    const [geminiError, setGeminiError] = useState(null);
    const [geminiLoading, setGeminiLoading] = useState(false);

    // 컴포넌트 마운트 시 코스 데이터 로드
    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const { data, error } = await getAllCourses();
                if (error) {
                    throw new Error(error);
                }
                setAllCourses(data || []);
                console.log("✅ 코스 데이터 로드 완료:", data?.length, "개");
            } catch (err) {
                console.error("❌ 코스 데이터 로드 실패:", err);
                setError(err.message);
            } finally {
                setLoading(false);
            }
        };

        fetchData();
    }, []);

    const handleViewDetail = (course) => {
        setSelectedCourse(course);
        setShowModal(true);
    };

    const handleCloseModal = () => {
        setShowModal(false);
        setSelectedCourse(null);
    };

    const handleModalViewMap = (course) => {
        // 지도에서 보기 로직 (필요시 구현)
        console.log("지도에서 보기:", course);
        handleCloseModal();
    };

    const handleTagSelectionChange = (tags) => {
        setSelectedTags(tags);
        console.log("선택된 태그들:", tags);
    };

    return (
        <div className="run-page-container">
            <Header />
            <div className="run-page">
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
                    <div
                        className="content-container"
                        style={{ position: "relative" }}
                    >
                        {geminiLoading && <LoadingScreen />}
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

                                {geminiError && (
                                    <div className="error-message">
                                        <p>
                                            ⚠️ AI 추천 중 오류가 발생했습니다:
                                        </p>
                                        <p>{geminiError}</p>
                                        <p>
                                            대신 랜덤 추천 결과를 보여드립니다.
                                        </p>
                                    </div>
                                )}

                                <div className="recommended-courses">
                                    {recommendedCourses.map((course) => (
                                        <div
                                            key={course.id}
                                            className="course-card"
                                            onClick={() =>
                                                handleViewDetail(course)
                                            }
                                        >
                                            <div className="course-image">
                                                {course.images &&
                                                course.images.length > 0 ? (
                                                    <img
                                                        src={course.images[0]}
                                                        alt={course.title}
                                                    />
                                                ) : (
                                                    <div className="placeholder-image">
                                                        🏃‍♂️
                                                    </div>
                                                )}
                                            </div>
                                            <div className="course-info">
                                                <h3>{course.title}</h3>
                                                <p>{course.description}</p>
                                                <div className="course-meta">
                                                    <span className="distance">
                                                        📏 {course.distance}km
                                                    </span>
                                                    <span className="creator">
                                                        👤 {course.creatorName}
                                                    </span>
                                                    <span className="likes">
                                                        ❤️ {course.likesCount}
                                                    </span>
                                                </div>
                                                {course.tags &&
                                                    course.tags.length > 0 && (
                                                        <div className="course-tags">
                                                            {course.tags
                                                                .slice(0, 3)
                                                                .map((tag) => (
                                                                    <span
                                                                        key={
                                                                            tag
                                                                        }
                                                                        className="tag"
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
                                                            {course.tags
                                                                .length > 3 && (
                                                                <span className="more-tags">
                                                                    +
                                                                    {course.tags
                                                                        .length -
                                                                        3}
                                                                </span>
                                                            )}
                                                        </div>
                                                    )}
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                <div className="action-buttons">
                                    <button
                                        className="back-btn"
                                        onClick={() => {
                                            setShowRecommendations(false);
                                            setSelectedTags([]);
                                            setRecommendedCourses([]);
                                            setGeminiRecommendations(null);
                                            setGeminiError(null);
                                        }}
                                    >
                                        🔄 다시 선택하기
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {showModal && selectedCourse && (
                <CourseDetailModal
                    course={selectedCourse}
                    onClose={handleCloseModal}
                    onViewMap={handleModalViewMap}
                />
            )}
        </div>
    );
};

export default RunPage;
