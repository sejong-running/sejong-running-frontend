import React from "react";
import "./LoadingSpinner.css";

const LoadingSpinner = ({ size = "medium", text = "로딩 중..." }) => {
    return (
        <div className={`loading-container size-${size}`}>
            <div className="loading-spinner">
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
                <div className="spinner-ring"></div>
            </div>
            <br />
            {text && <p className="loading-text">{text}</p>}
        </div>
    );
};

export default LoadingSpinner;
