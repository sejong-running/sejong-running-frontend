import React from "react";
import "./LoadingScreen.css";

const LoadingScreen = () => {
    return (
        <div className="loading-overlay">
            <div className="loading-content">
                {/* 로딩 텍스트 */}
                <h3 className="loading-title">로딩중...</h3>

                {/* 로딩 바 */}
                <div className="loading-bar">
                    <div className="loading-progress"></div>
                </div>
            </div>
        </div>
    );
};

export default LoadingScreen;
