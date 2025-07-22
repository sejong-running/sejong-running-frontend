import React from "react";
import "./Header.css";

const Header = ({ onMenuClick }) => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <button className="menu-button" onClick={onMenuClick}>
                        <span className="menu-icon">☰</span>
                    </button>
                    <div className="logo">
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
                    <button className="user-button">
                        <span className="user-icon">👤</span>
                    </button>
                </div>
            </div>
        </header>
    );
};

export default Header;
