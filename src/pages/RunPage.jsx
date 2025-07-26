import React, { useState, useEffect } from "react";
import "./RunPage.css";
import Header from "../components/shared/Header";
import CourseDetailModal from "../components/shared/CourseDetailModal";
import SimpleTagSelector from "../components/shared/SimpleTagSelector";
import RecommendationCard from "../components/shared/RecommendationCard";
import LoadingScreen from "../components/shared/LoadingScreen";
import { getAllCourses } from "../services";
import { getTagColor } from "../data/runningTags";
import { getGeminiCourseRecommendations } from "../services/geminiRecommendationService";

const RunPage = () => {
    const [allCourses, setAllCourses] = useState([]);
    const [recommendedCourses, setRecommendedCourses] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [modalCourse, setModalCourse] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedTags, setSelectedTags] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);
    const [geminiRecommendations, setGeminiRecommendations] = useState(null);
    const [geminiLoading, setGeminiLoading] = useState(false);
    const [geminiError, setGeminiError] = useState(null);

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

    // Gemini API 기반 태그 추천
    const handleGetRecommendations = async () => {
        if (selectedTags.length === 0) {
            alert("추천받으려면 최소 하나의 태그를 선택해주세요!");
            return;
        }

        if (allCourses.length === 0) {
            alert(
                "코스 데이터를 불러오는 중입니다. 잠시 후 다시 시도해주세요."
            );
            return;
        }

        try {
            setGeminiLoading(true);
            setGeminiError(null);

            console.log("🎯 Gemini API 추천 시작...");
            console.log("선택된 태그:", selectedTags);
            console.log("전체 코스 데이터:", allCourses.length, "개");

            // Gemini API 호출
            const recommendations = await getGeminiCourseRecommendations(
                selectedTags,
                allCourses
            );

            console.log("✅ Gemini 추천 결과:", recommendations);

            // 추천 결과 저장
            setGeminiRecommendations(recommendations);

            // 추천된 코스들을 기존 형태로 변환
            const recommendedCoursesList = recommendations.recommendations
                .map((rec) => rec.courseInfo)
                .filter((course) => course !== null);

            setRecommendedCourses(recommendedCoursesList);
            setShowRecommendations(true);
        } catch (error) {
            console.error("❌ Gemini 추천 실패:", error);
            setGeminiError(error.message);

            // 에러 발생시 랜덤 추천으로 폴백
            console.log("🎲 랜덤 추천으로 폴백...");
            const shuffled = [...allCourses].sort(() => 0.5 - Math.random());
            setRecommendedCourses(shuffled.slice(0, 3));
            setShowRecommendations(true);
        } finally {
            setGeminiLoading(false);
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
        setGeminiRecommendations(null);
        setGeminiError(null);
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
                                        loading ||
                                        selectedTags.length === 0 ||
                                        geminiLoading
                                    }
                                >
                                    {geminiLoading
                                        ? "🤖 AI 분석 중..."
                                        : "🎯 태그 기반 추천"}
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
                                    onClick={handleReset}
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

                                {/* Gemini 에러 메시지 */}
                                {geminiError && (
                                    <div className="gemini-error">
                                        <p>
                                            ⚠️ AI 추천 중 오류가 발생했습니다:{" "}
                                            {geminiError}
                                        </p>
                                        <p>📝 랜덤 추천으로 대신 표시됩니다.</p>
                                    </div>
                                )}

                                <div className="cards-container">
                                    {geminiRecommendations && !geminiError
                                        ? // Gemini AI 추천 카드들
                                          geminiRecommendations.recommendations.map(
                                              (recommendation, index) => (
                                                  <RecommendationCard
                                                      key={
                                                          recommendation.courseId ||
                                                          index
                                                      }
                                                      recommendation={
                                                          recommendation
                                                      }
                                                      index={index}
                                                      onViewDetail={
                                                          handleViewDetail
                                                      }
                                                      onViewMap={
                                                          handleModalViewMap
                                                      }
                                                  />
                                              )
                                          )
                                        : // 기본 추천 카드들 (에러 시 또는 랜덤 추천)
                                          recommendedCourses.map(
                                              (course, index) => (
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
                                                              {
                                                                  course.description
                                                              }
                                                          </p>

                                                          <div className="card-info">
                                                              <div className="info-row">
                                                                  <span className="info-item">
                                                                      📏{" "}
                                                                      {
                                                                          course.distance
                                                                      }
                                                                      km
                                                                  </span>
                                                                  <span className="info-item">
                                                                      ❤️{" "}
                                                                      {
                                                                          course.likesCount
                                                                      }
                                                                  </span>
                                                              </div>
                                                              <div className="info-row">
                                                                  <span className="info-item">
                                                                      👤{" "}
                                                                      {
                                                                          course.creatorName
                                                                      }
                                                                  </span>
                                                              </div>
                                                          </div>

                                                          {course.tags &&
                                                              course.tags
                                                                  .length >
                                                                  0 && (
                                                                  <div className="card-tags">
                                                                      {course.tags
                                                                          .slice(
                                                                              0,
                                                                              2
                                                                          )
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
                                              )
                                          )}
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
