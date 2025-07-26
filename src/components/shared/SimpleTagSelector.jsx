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
            // 시간 관련 카테고리는 1개만 선택 가능
            const timeCategories = ['duration', 'timePreference'];
            const tagCategory = runningTagCategories.find(cat => cat.tags.includes(tag));
            
            if (tagCategory && timeCategories.includes(tagCategory.id)) {
                // 같은 시간 카테고리의 다른 태그들 제거
                const otherTimeTags = tagCategory.tags;
                newSelection = currentSelection.filter(t => !otherTimeTags.includes(t));
                newSelection.push(tag);
            } else {
                newSelection = [...currentSelection, tag];
            }
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
                                        onClick={() => handleTagToggle(tag)}
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
        </div>
    );
};

export default SimpleTagSelector;
