import React, { useState } from "react";
import "./SimpleTagSelector.css";
import { runningTagCategories, getTagColor } from "../../data/runningTags";

const SimpleTagSelector = ({ onSelectionChange, selectedTags = [] }) => {
    const [currentSelection, setCurrentSelection] = useState(selectedTags);

    const handleTagToggle = (tag) => {
        let newSelection;
        if (currentSelection.includes(tag)) {
            newSelection = currentSelection.filter((t) => t !== tag);
        } else {
            newSelection = [...currentSelection, tag];
        }

        setCurrentSelection(newSelection);
        onSelectionChange(newSelection);
    };

    const removeTag = (tagToRemove) => {
        const newSelection = currentSelection.filter(
            (tag) => tag !== tagToRemove
        );
        setCurrentSelection(newSelection);
        onSelectionChange(newSelection);
    };

    const clearAllTags = () => {
        setCurrentSelection([]);
        onSelectionChange([]);
    };

    return (
        <div className="simple-tag-selector">
            {/* 선택된 태그 모아보기 영역 */}
            {currentSelection.length > 0 && (
                <div className="selected-tags-section">
                    <div className="selected-tags-header">
                        <h3>선택된 태그 ({currentSelection.length}개)</h3>
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
                                style={{ backgroundColor: getTagColor(tag) }}
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

            {/* 태그 선택 영역 */}
            <h2>🏃‍♂️ 오늘의 러닝 취향을 선택해보세요</h2>
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
                                        onClick={() => handleTagToggle(tag)}
                                        style={{
                                            backgroundColor: categoryColor,
                                            color: "white",
                                            border: "none",
                                            opacity: isSelected ? 1 : 0.7,
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
        </div>
    );
};

export default SimpleTagSelector;
