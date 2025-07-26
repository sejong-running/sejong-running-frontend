import React, { useState, useEffect } from "react";
import "./CourseFilter.css";

const CourseFilter = ({ 
    onFilterChange, 
    courseTypes = [], 
    maxDistance = 0,
    initialFilters = {
        sortBy: 'name',
        sortDirection: 'asc',
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
        let newSortDirection = 'desc';
        
        if (filters.sortBy === sortBy) {
            // 같은 정렬 방식이면 방향 변경
            if (filters.sortDirection === 'desc') {
                newSortDirection = 'asc';
            } else if (filters.sortDirection === 'asc') {
                // 선택 해제 (기본값으로)
                const newFilters = {
                    ...filters,
                    sortBy: 'name',
                    sortDirection: 'asc'
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
                return;
            }
        }
        
        const newFilters = { 
            ...filters, 
            sortBy, 
            sortDirection: newSortDirection 
        };
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
            sortBy: 'name',
            sortDirection: 'asc',
            selectedTypes: [],
            distanceRange: [0, maxDistance]
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const hasActiveFilters = filters.selectedTypes.length > 0 || 
                           filters.sortBy !== 'name' || 
                           filters.sortDirection !== 'asc' ||
                           (filters.distanceRange[0] > 0 || filters.distanceRange[1] < maxDistance);

    return (
        <div className="course-filter">
            <div className="filter-content">
                {/* 코스 유형 */}
                <div className="filter-section">
                    <div className="type-options">
                        {courseTypes
                            .sort((a, b) => b.id - a.id)
                            .map((type) => (
                            <button
                                key={type.id}
                                className={`type-option ${filters.selectedTypes.includes(type.id) ? 'active' : ''}`}
                                onClick={() => handleTypeToggle(type.id)}
                            >
                                #{type.name}
                            </button>
                        ))}
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
                {/* 정렬 방식 */}
                <div className="filter-section">
                    <div className="sort-options">
                        <button
                            className={`sort-option ${filters.sortBy === 'popular' ? 'active' : ''}`}
                            onClick={() => handleSortChange('popular')}
                        >
                            인기순
                            {filters.sortBy === 'popular' && (
                                <span className="sort-arrow">
                                    {filters.sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                        <button
                            className={`sort-option ${filters.sortBy === 'latest' ? 'active' : ''}`}
                            onClick={() => handleSortChange('latest')}
                        >
                            최신순
                            {filters.sortBy === 'latest' && (
                                <span className="sort-arrow">
                                    {filters.sortDirection === 'asc' ? '↑' : '↓'}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CourseFilter; 