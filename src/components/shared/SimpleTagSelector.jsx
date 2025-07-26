import React, { useState, useEffect } from "react";
import "./SimpleTagSelector.css";
import { runningTagCategories, getTagColor } from "../../data/runningTags";
import RecommendationCard from "./RecommendationCard";
import { getGeminiCourseRecommendations } from "../../services/geminiRecommendationService";
import { getAllCourses } from "../../services/coursesService";

const SimpleTagSelector = ({ onSelectionChange, selectedTags = [] }) => {
    const [currentSelection, setCurrentSelection] = useState(selectedTags);
    const [recommendations, setRecommendations] = useState([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);
    const [allCourses, setAllCourses] = useState([]);
    const [showRecommendations, setShowRecommendations] = useState(false);

    // 컴포넌트 마운트 시 코스 데이터 로드
    useEffect(() => {
        const loadCourses = async () => {
            try {
                const { data, error } = await getAllCourses();
                if (error) throw new Error(error);
                setAllCourses(data || []);
            } catch (err) {
                console.error("코스 데이터 로드 실패:", err);
                setError("코스 데이터를 불러올 수 없습니다.");
            }
        };
        loadCourses();
    }, []);

    const handleTagToggle = (tag) => {
        let newSelection;
        if (currentSelection.includes(tag)) {
            newSelection = currentSelection.filter((t) => t !== tag);
        } else {
            // 시간 관련 카테고리는 1개만 선택 가능
            const timeCategories = ["duration", "timePreference"];
            const tagCategory = runningTagCategories.find((cat) =>
                cat.tags.includes(tag)
            );

            if (tagCategory && timeCategories.includes(tagCategory.id)) {
                // 같은 시간 카테고리의 다른 태그들 제거
                const otherTimeTags = tagCategory.tags;
                newSelection = currentSelection.filter(
                    (t) => !otherTimeTags.includes(t)
                );
                newSelection.push(tag);
            } else {
                newSelection = [...currentSelection, tag];
            }
        }

        setCurrentSelection(newSelection);
        onSelectionChange(newSelection);

        // 태그가 변경되면 추천 영역 초기화
        setShowRecommendations(false);
        setRecommendations([]);
        setError(null);
    };

    const removeTag = (tagToRemove) => {
        const newSelection = currentSelection.filter(
            (tag) => tag !== tagToRemove
        );
        setCurrentSelection(newSelection);
        onSelectionChange(newSelection);

        // 태그가 변경되면 추천 영역 초기화
        setShowRecommendations(false);
        setRecommendations([]);
        setError(null);
    };

    const clearAllTags = () => {
        setCurrentSelection([]);
        onSelectionChange([]);

        // 태그가 변경되면 추천 영역 초기화
        setShowRecommendations(false);
        setRecommendations([]);
        setError(null);
    };

    const handleGetRecommendations = async () => {
        if (currentSelection.length === 0) {
            setError("태그를 먼저 선택해주세요.");
            return;
        }

        if (allCourses.length === 0) {
            setError("코스 데이터를 불러올 수 없습니다.");
            return;
        }

        setIsLoading(true);
        setError(null);
        setShowRecommendations(true);

        try {
            const result = await getGeminiCourseRecommendations(
                currentSelection,
                allCourses
            );
            setRecommendations(result.recommendations || []);
        } catch (err) {
            console.error("추천 요청 실패:", err);
            setError(err.message || "추천을 받을 수 없습니다.");
            setRecommendations([]);
        } finally {
            setIsLoading(false);
        }
    };

    const handleViewDetail = (courseInfo) => {
        // 상세 정보 보기 로직 (필요시 구현)
        console.log("상세 정보 보기:", courseInfo);
    };

    const handleViewMap = (courseInfo) => {
        // 지도에서 보기 로직 (필요시 구현)
        console.log("지도에서 보기:", courseInfo);
    };

    return (
        <div className="simple-tag-selector-container">
            {/* 태그 선택 영역 */}
            <div className="tag-selector-section">
                <div className="simple-tag-selector">
                    {/* 태그 선택 영역 */}
                    <div className="tag-selection-section">
                        {runningTagCategories.map((category) => (
                            <div key={category.id} className="category-row">
                                <div className="category-tags">
                                    {category.tags.map((tag) => {
                                        const isSelected =
                                            currentSelection.includes(tag);
                                        const categoryColor = getTagColor(tag);
                                        return (
                                            <button
                                                key={tag}
                                                className={`tag-button ${
                                                    isSelected ? "selected" : ""
                                                }`}
                                                onClick={() =>
                                                    handleTagToggle(tag)
                                                }
                                                style={{
                                                    backgroundColor: isSelected
                                                        ? categoryColor
                                                        : "#f3f4f6",
                                                    color: isSelected
                                                        ? "white"
                                                        : "#6b7280",
                                                    border: isSelected
                                                        ? "1px solid transparent"
                                                        : "1px solid #d1d5db",
                                                    opacity: 1,
                                                }}
                                            >
                                                {tag}
                                            </button>
                                        );
                                    })}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* 선택된 태그 모아보기 영역 */}
                    {currentSelection.length > 0 && (
                        <div className="selected-tags-section">
                            <div className="selected-tags-header">
                                <h3>
                                    선택된 태그 ({currentSelection.length}개)
                                </h3>
                                <button
                                    className="clear-all-btn"
                                    onClick={clearAllTags}
                                >
                                    전체 삭제
                                </button>
                            </div>
                            <div className="selected-tags-list">
                                {currentSelection.map((tag) => (
                                    <div
                                        key={tag}
                                        className="selected-tag-item"
                                        style={{
                                            backgroundColor: getTagColor(tag),
                                        }}
                                    >
                                        <span className="tag-text">{tag}</span>
                                        <button
                                            className="remove-tag-btn"
                                            onClick={() => removeTag(tag)}
                                        >
                                            ×
                                        </button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* 추천 카드 영역 - 항상 표시 */}
            <div className="recommendations-section">
                {!showRecommendations ? (
                    // 추천받기 버튼 클릭 전 안내 영역
                    <div className="recommendations-placeholder">
                        {/* <div className="placeholder-header">
                            <h3>🎯 AI 추천 코스</h3>
                            <span className="placeholder-subtitle">
                                맞춤형 러닝 코스를 추천받아보세요!
                            </span>
                        </div> */}

                        {currentSelection.length === 0 ? (
                            <div className="no-selection-message">
                                {/* <div className="message-icon">🏷️</div> */}
                                <p>
                                    태그를 선택하면 AI가 맞춤형 코스를
                                    추천해드립니다!
                                </p>
                                <div className="message-steps">
                                    <div className="step">
                                        <span className="step-number">1</span>
                                        <span>원하는 태그를 선택하세요</span>
                                    </div>
                                    <div className="step">
                                        <span className="step-number">2</span>
                                        <span>
                                            AI 추천받기 버튼을 클릭하세요
                                        </span>
                                    </div>
                                    <div className="step">
                                        <span className="step-number">3</span>
                                        <span>맞춤형 코스를 확인하세요</span>
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <div className="ready-for-recommendation">
                                <div className="ready-content">
                                    <div className="ready-icon">✨</div>
                                    <p>
                                        선택한 태그:{" "}
                                        <strong>
                                            {currentSelection.join(", ")}
                                        </strong>
                                    </p>
                                    <p>
                                        아래 버튼을 클릭하여 맞춤형 코스를
                                        받아보세요!
                                    </p>
                                </div>

                                {/* 추천받기 버튼 */}
                                <div className="recommendation-button-container">
                                    <button
                                        className={`recommendation-btn ${
                                            isLoading ? "loading" : ""
                                        }`}
                                        onClick={handleGetRecommendations}
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <div className="btn-loading-spinner"></div>
                                                추천 생성 중...
                                            </>
                                        ) : (
                                            <>AI 추천받기</>
                                        )}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                ) : (
                    // 추천받기 버튼 클릭 후 추천 결과 영역
                    <>
                        <div className="recommendations-header">
                            <h3>AI 추천 코스</h3>
                            <span className="selection-count">
                                {currentSelection.length}개 태그 기반
                            </span>
                        </div>

                        {isLoading && (
                            <div className="loading-container">
                                <div className="loading-spinner"></div>
                                <p>AI가 최적의 코스를 찾고 있습니다...</p>
                            </div>
                        )}

                        {error && (
                            <div className="error-container">
                                <div className="error-icon">⚠️</div>
                                <p>{error}</p>
                            </div>
                        )}

                        {!isLoading && !error && recommendations.length > 0 && (
                            <div className="recommendations-list">
                                {recommendations.map(
                                    (recommendation, index) => (
                                        <RecommendationCard
                                            key={`${
                                                recommendation.courseInfo?.id ||
                                                index
                                            }-${index}`}
                                            recommendation={recommendation}
                                            index={index}
                                            onViewDetail={handleViewDetail}
                                            onViewMap={handleViewMap}
                                        />
                                    )
                                )}
                            </div>
                        )}

                        {!isLoading &&
                            !error &&
                            recommendations.length === 0 &&
                            showRecommendations && (
                                <div className="no-recommendations">
                                    <div className="no-rec-icon">🤔</div>
                                    <p>
                                        선택한 태그에 맞는 추천 코스를 찾을 수
                                        없습니다.
                                    </p>
                                    <p>다른 태그를 선택해보세요!</p>
                                </div>
                            )}
                    </>
                )}
            </div>
        </div>
    );
};

export default SimpleTagSelector;
