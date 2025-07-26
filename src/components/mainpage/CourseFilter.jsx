import React, { useState, useEffect } from "react";
import "./CourseFilter.css";

const CourseFilter = ({ 
    onFilterChange, 
    courseTypes = [], 
    maxDistance = 0,
    initialFilters = {
        sortBy: 'popular',
        selectedTypes: [],
        distanceRange: [0, maxDistance]
    }
}) => {
    const [filters, setFilters] = useState(initialFilters);

    // 최대 거리가 변경되면 거리 범위 업데이트
    useEffect(() => {
        if (maxDistance > 0) {
            setFilters(prev => ({
                ...prev,
                distanceRange: [0, maxDistance]
            }));
        }
    }, [maxDistance]);

    const handleSortChange = (sortBy) => {
        const newFilters = { ...filters, sortBy };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleTypeToggle = (typeId) => {
        const newSelectedTypes = filters.selectedTypes.includes(typeId)
            ? filters.selectedTypes.filter(id => id !== typeId)
            : [...filters.selectedTypes, typeId];
        
        const newFilters = { ...filters, selectedTypes: newSelectedTypes };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDistanceChange = (min, max) => {
        const newFilters = { 
            ...filters, 
            distanceRange: [min, max] 
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const clearFilters = () => {
        const newFilters = {
            sortBy: 'popular',
            selectedTypes: [],
            distanceRange: [0, maxDistance]
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const hasActiveFilters = filters.selectedTypes.length > 0 || 
                           filters.sortBy !== 'popular' || 
                           (filters.distanceRange[0] > 0 || filters.distanceRange[1] < maxDistance);

    return (
        <div className="course-filter">
            <div className="filter-header">
                <div className="filter-title-section">
                    <span className="filter-icon">🔍</span>
                    <span className="filter-title">필터</span>
                    {hasActiveFilters && <span className="filter-badge">●</span>}
                </div>
                
                {hasActiveFilters && (
                    <button 
                        className="clear-filters-btn"
                        onClick={clearFilters}
                        aria-label="필터 초기화"
                    >
                        초기화
                    </button>
                )}
            </div>

            <div className="filter-content">
                {/* 정렬 방식 */}
                <div className="filter-section">
                    <div className="sort-options">
                        <button
                            className={`sort-option ${filters.sortBy === 'popular' ? 'active' : ''}`}
                            onClick={() => handleSortChange('popular')}
                        >
                            <span className="sort-icon">❤️</span>
                            인기순
                            {filters.sortBy === 'popular' && <span className="sort-arrow">↓</span>}
                        </button>
                        <button
                            className={`sort-option ${filters.sortBy === 'latest' ? 'active' : ''}`}
                            onClick={() => handleSortChange('latest')}
                        >
                            <span className="sort-icon">🕐</span>
                            최신순
                            {filters.sortBy === 'latest' && <span className="sort-arrow">↓</span>}
                        </button>
                    </div>
                </div>

                {/* 거리 범위 */}
                <div className="filter-section">
                    <div className="distance-range">
                        <div className="distance-display">
                            {filters.distanceRange[0].toFixed(1)}km - {filters.distanceRange[1].toFixed(1)}km
                        </div>
                        <div className="distance-slider">
                            <input
                                type="range"
                                min="0"
                                max={maxDistance}
                                step="0.1"
                                value={filters.distanceRange[0]}
                                onChange={(e) => {
                                    const newMin = parseFloat(e.target.value);
                                    const newMax = Math.max(newMin, filters.distanceRange[1]);
                                    handleDistanceChange(newMin, newMax);
                                }}
                                className="range-input min-range"
                            />
                            <input
                                type="range"
                                min="0"
                                max={maxDistance}
                                step="0.1"
                                value={filters.distanceRange[1]}
                                onChange={(e) => {
                                    const newMax = parseFloat(e.target.value);
                                    const newMin = Math.min(newMax, filters.distanceRange[0]);
                                    handleDistanceChange(newMin, newMax);
                                }}
                                className="range-input max-range"
                            />
                        </div>
                    </div>
                </div>

                {/* 코스 유형 */}
                <div className="filter-section">
                    <div className="type-options">
                        {courseTypes.map((type) => (
                            <button
                                key={type.id}
                                className={`type-option ${filters.selectedTypes.includes(type.id) ? 'active' : ''}`}
                                onClick={() => handleTypeToggle(type.id)}
                            >
                                {type.name}
                            </button>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseFilter; 