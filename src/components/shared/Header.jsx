import React from "react";
import "./Header.css";

const Header = ({ onNavigate }) => {
    const handleMyPageClick = () => {
        onNavigate && onNavigate("mypage");
    };

    const handleHomeClick = () => {
        onNavigate && onNavigate("home");
    };

    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <div
                        className="logo"
                        onClick={handleHomeClick}
                        style={{ cursor: "pointer" }}
                    >
                        <h1>🏃‍♂️ 세종러닝</h1>
                    </div>
                </div>

                <div className="header-center">
                    <div className="search-container">
                        <input
                            type="text"
                            placeholder="코스를 검색해보세요..."
                            className="search-input"
                        />
                        <button className="search-button">🔍</button>
                    </div>
                </div>

                <div className="header-right">
                    <button className="user-button" onClick={handleMyPageClick}>
                        <span className="user-icon">👤</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
