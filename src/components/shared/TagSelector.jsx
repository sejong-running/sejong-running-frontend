import React, { useState } from 'react';
import './TagSelector.css';
import { runningTagCategories } from '../../data/runningTags';

const TagSelector = ({ onSelectionChange, initialSelection = {} }) => {
    const [selectedTags, setSelectedTags] = useState(initialSelection.tags || []);
    const [customLocation, setCustomLocation] = useState(initialSelection.customLocation || '');
    const [expandedCategories, setExpandedCategories] = useState({});

    const handleTagToggle = (categoryId, tagId, multiSelect) => {
        let newSelectedTags;
        
        if (multiSelect) {
            // 다중 선택 가능한 카테고리
            if (selectedTags.includes(tagId)) {
                newSelectedTags = selectedTags.filter(id => id !== tagId);
            } else {
                newSelectedTags = [...selectedTags, tagId];
            }
        } else {
            // 단일 선택 카테고리 - 같은 카테고리의 다른 태그들 제거
            const category = runningTagCategories.find(cat => cat.id === categoryId);
            const categoryTagIds = category.tags.map(tag => tag.id);
            
            // 현재 카테고리의 다른 태그들 제거
            const filteredTags = selectedTags.filter(id => !categoryTagIds.includes(id));
            
            if (selectedTags.includes(tagId)) {
                // 이미 선택된 태그를 다시 클릭하면 제거
                newSelectedTags = filteredTags;
            } else {
                // 새 태그 추가
                newSelectedTags = [...filteredTags, tagId];
            }
        }
        
        setSelectedTags(newSelectedTags);
        onSelectionChange({
            tags: newSelectedTags,
            customLocation
        });
    };

    const handleLocationChange = (value) => {
        setCustomLocation(value);
        onSelectionChange({
            tags: selectedTags,
            customLocation: value
        });
    };

    const toggleCategoryExpanded = (categoryId) => {
        setExpandedCategories(prev => ({
            ...prev,
            [categoryId]: !prev[categoryId]
        }));
    };

    const getSelectedTagsForCategory = (categoryId) => {
        const category = runningTagCategories.find(cat => cat.id === categoryId);
        return category.tags.filter(tag => selectedTags.includes(tag.id));
    };

    const clearAllTags = () => {
        setSelectedTags([]);
        setCustomLocation('');
        onSelectionChange({
            tags: [],
            customLocation: ''
        });
    };

    const getTotalSelectedCount = () => {
        return selectedTags.length + (customLocation.trim() ? 1 : 0);
    };

    return (
        <div className="tag-selector">
            <div className="tag-selector-header">
                <h2>💫 나만의 러닝 취향 설정</h2>
                <div className="selection-summary">
                    <span className="selected-count">
                        {getTotalSelectedCount()}개 선택됨
                    </span>
                    {getTotalSelectedCount() > 0 && (
                        <button 
                            className="clear-all-btn"
                            onClick={clearAllTags}
                        >
                            전체 초기화
                        </button>
                    )}
                </div>
            </div>

            <div className="categories-container">
                {runningTagCategories.map(category => {
                    const isExpanded = expandedCategories[category.id] !== false; // 기본적으로 열림
                    const selectedCategoryTags = getSelectedTagsForCategory(category.id);
                    
                    return (
                        <div key={category.id} className="category-section">
                            <div 
                                className="category-header"
                                onClick={() => toggleCategoryExpanded(category.id)}
                            >
                                <div className="category-title">
                                    <span className="category-emoji">{category.emoji}</span>
                                    <div className="category-text">
                                        <h3>{category.title}</h3>
                                        <span className="category-subtitle">{category.subtitle}</span>
                                    </div>
                                </div>
                                <div className="category-status">
                                    {selectedCategoryTags.length > 0 && (
                                        <span className="selected-indicator">
                                            {selectedCategoryTags.length}
                                        </span>
                                    )}
                                    <span className={`expand-icon ${isExpanded ? 'expanded' : ''}`}>
                                        ▼
                                    </span>
                                </div>
                            </div>

                            {selectedCategoryTags.length > 0 && (
                                <div className="selected-tags-preview">
                                    {selectedCategoryTags.map(tag => (
                                        <span 
                                            key={tag.id} 
                                            className="selected-tag-chip"
                                            style={{ backgroundColor: tag.color || '#6b7280' }}
                                        >
                                            {tag.label}
                                        </span>
                                    ))}
                                </div>
                            )}

                            {isExpanded && (
                                <div className="category-content">
                                    <p className="category-description">{category.description}</p>
                                    
                                    <div className="tags-grid">
                                        {category.tags.map(tag => {
                                            const isSelected = selectedTags.includes(tag.id);
                                            
                                            if (tag.inputField) {
                                                return (
                                                    <div key={tag.id} className="tag-input-container">
                                                        <label className="tag-label">
                                                            <input
                                                                type="radio"
                                                                name={`location-${category.id}`}
                                                                checked={customLocation.length > 0}
                                                                onChange={() => {}}
                                                                className="tag-radio"
                                                            />
                                                            <span className="tag-text">{tag.label}</span>
                                                        </label>
                                                        <input
                                                            type="text"
                                                            placeholder="예: 세종시 보람동, 대전 유성구"
                                                            value={customLocation}
                                                            onChange={(e) => handleLocationChange(e.target.value)}
                                                            className="location-input"
                                                        />
                                                        <p className="tag-description">{tag.description}</p>
                                                    </div>
                                                );
                                            }
                                            
                                            return (
                                                <div 
                                                    key={tag.id}
                                                    className={`tag-option ${isSelected ? 'selected' : ''} ${tag.popular ? 'popular' : ''}`}
                                                    onClick={() => handleTagToggle(category.id, tag.id, category.multiSelect)}
                                                    style={isSelected ? { 
                                                        backgroundColor: tag.color || '#6b7280',
                                                        borderColor: tag.color || '#6b7280'
                                                    } : {}}
                                                >
                                                    {tag.popular && <span className="popular-badge">인기</span>}
                                                    <span className="tag-label">{tag.label}</span>
                                                    <p className="tag-description">{tag.description}</p>
                                                </div>
                                            );
                                        })}
                                    </div>
                                    
                                    {category.multiSelect && (
                                        <p className="multi-select-hint">💡 여러 개 선택 가능해요!</p>
                                    )}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default TagSelector;