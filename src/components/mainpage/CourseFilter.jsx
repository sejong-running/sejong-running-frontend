import React, { useState, useEffect } from "react";
import "./CourseFilter.css";

const CourseFilter = ({
    onFilterChange,
    courseTypes = [],
    maxDistance = 0,
    initialFilters = {
        sortBy: "name",
        sortDirection: "asc",
        selectedTypes: [],
        distanceRange: [0, maxDistance],
    },
    searchQuery = "",
    onSearchChange,
}) => {
    const [filters, setFilters] = useState(initialFilters);

    // 최대 거리가 변경되면 거리 범위 업데이트
    useEffect(() => {
        if (maxDistance > 0) {
            setFilters((prev) => ({
                ...prev,
                distanceRange: [0, maxDistance],
            }));
        }
    }, [maxDistance]);

    // CSS 변수 초기화 및 업데이트
    useEffect(() => {
        if (maxDistance > 0) {
            const minPercent = (filters.distanceRange[0] / maxDistance) * 100;
            const maxPercent = (filters.distanceRange[1] / maxDistance) * 100;

            const sliderElement = document.querySelector(".distance-slider");
            if (sliderElement) {
                sliderElement.style.setProperty(
                    "--min-percent",
                    `${minPercent}%`
                );
                sliderElement.style.setProperty(
                    "--max-percent",
                    `${maxPercent}%`
                );
            }
        }
    }, [filters.distanceRange, maxDistance]);

    const handleSortChange = (sortBy) => {
        let newSortDirection = "desc";

        if (filters.sortBy === sortBy) {
            // 같은 정렬 방식이면 방향 변경
            if (filters.sortDirection === "desc") {
                newSortDirection = "asc";
            } else if (filters.sortDirection === "asc") {
                // 선택 해제 (기본값으로)
                const newFilters = {
                    ...filters,
                    sortBy: "name",
                    sortDirection: "asc",
                };
                setFilters(newFilters);
                onFilterChange(newFilters);
                return;
            }
        }

        const newFilters = {
            ...filters,
            sortBy,
            sortDirection: newSortDirection,
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleTypeToggle = (typeId) => {
        const newSelectedTypes = filters.selectedTypes.includes(typeId)
            ? filters.selectedTypes.filter((id) => id !== typeId)
            : [...filters.selectedTypes, typeId];

        const newFilters = { ...filters, selectedTypes: newSelectedTypes };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const handleDistanceChange = (min, max) => {
        const newFilters = {
            ...filters,
            distanceRange: [min, max],
        };
        setFilters(newFilters);
        onFilterChange(newFilters);

        // CSS 변수 업데이트로 범위 시각화
        const minPercent = (min / maxDistance) * 100;
        const maxPercent = (max / maxDistance) * 100;

        const sliderElement = document.querySelector(".distance-slider");
        if (sliderElement) {
            sliderElement.style.setProperty("--min-percent", `${minPercent}%`);
            sliderElement.style.setProperty("--max-percent", `${maxPercent}%`);
        }
    };

    const clearFilters = () => {
        const newFilters = {
            sortBy: "name",
            sortDirection: "asc",
            selectedTypes: [],
            distanceRange: [0, maxDistance],
        };
        setFilters(newFilters);
        onFilterChange(newFilters);
    };

    const hasActiveFilters =
        filters.selectedTypes.length > 0 ||
        filters.sortBy !== "name" ||
        filters.sortDirection !== "asc" ||
        filters.distanceRange[0] > 0 ||
        filters.distanceRange[1] < maxDistance;

    return (
        <div className="course-filter">
            <div className="filter-content">
                {/* 검색 */}
                <div className="filter-section">
                    <div className="search-input-wrapper">
                        <svg
                            className="search-icon"
                            viewBox="0 0 24 24"
                            width="16"
                            height="16"
                        >
                            <path
                                fill="currentColor"
                                d="M15.5 14h-.79l-.28-.27a6.5 6.5 0 0 0 1.48-5.34c-.47-2.78-2.79-5-5.59-5.34a6.505 6.505 0 0 0-7.27 7.27c.34 2.8 2.56 5.12 5.34 5.59a6.5 6.5 0 0 0 5.34-1.48l.27.28v.79l4.25 4.25c.41.41 1.08.41 1.49 0 .41-.41.41-1.08 0-1.49L15.5 14zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14z"
                            />
                        </svg>
                        <input
                            type="text"
                            placeholder="코스 검색"
                            value={searchQuery}
                            onChange={(e) => onSearchChange(e.target.value)}
                            className="search-input"
                        />
                        {searchQuery && (
                            <button
                                className="search-clear"
                                onClick={() => onSearchChange("")}
                                aria-label="검색어 지우기"
                            >
                                <svg viewBox="0 0 24 24" width="16" height="16">
                                    <path
                                        fill="currentColor"
                                        d="M19 6.41L17.59 5 12 10.59 6.41 5 5 6.41 10.59 12 5 17.59 6.41 19 12 13.41 17.59 19 19 17.59 13.41 12 19 6.41z"
                                    />
                                </svg>
                            </button>
                        )}
                    </div>
                </div>
                {/* 코스 유형 */}
                <div className="filter-section">
                    <div className="type-options">
                        {courseTypes
                            .sort((a, b) => b.id - a.id)
                            .map((type) => (
                                <button
                                    key={type.id}
                                    className={`type-option ${
                                        filters.selectedTypes.includes(type.id)
                                            ? "active"
                                            : ""
                                    }`}
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
                            {filters.distanceRange[0].toFixed(1)}km -{" "}
                            {filters.distanceRange[1].toFixed(1)}km
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
                                    const newMax = Math.max(
                                        newMin,
                                        filters.distanceRange[1]
                                    );
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
                                    const newMin = Math.min(
                                        newMax,
                                        filters.distanceRange[0]
                                    );
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
                            className={`sort-option ${
                                filters.sortBy === "popular" ? "active" : ""
                            }`}
                            onClick={() => handleSortChange("popular")}
                        >
                            인기순
                            {filters.sortBy === "popular" && (
                                <span className="sort-arrow">
                                    {filters.sortDirection === "asc"
                                        ? "↑"
                                        : "↓"}
                                </span>
                            )}
                        </button>
                        <button
                            className={`sort-option ${
                                filters.sortBy === "latest" ? "active" : ""
                            }`}
                            onClick={() => handleSortChange("latest")}
                        >
                            최신순
                            {filters.sortBy === "latest" && (
                                <span className="sort-arrow">
                                    {filters.sortDirection === "asc"
                                        ? "↑"
                                        : "↓"}
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
