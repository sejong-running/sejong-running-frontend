import React from "react";
import "./MainPageListHeader.css";

const ListHeader = ({ title, count, loading }) => {
    return (
        <div className="sidebar-header">
            <div className="sidebar-header-content">
                <h2>{title}</h2>
                <span className="course-count">
                    {loading ? "로딩 중..." : `${count}개 코스`}
                </span>
            </div>
        </div>
    );
};

export default ListHeader; 