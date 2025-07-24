import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                <div className="header-left">
                    <Link
                        to="/"
                        className="logo"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <h1>🏃‍♂️ 세종러닝</h1>
                    </Link>
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
                    <Link
                        to="/mypage"
                        className="user-button"
                        style={{ textDecoration: "none", color: "inherit" }}
                    >
                        <span className="user-icon">👤</span>
                    </Link>
                </div>
            </div>
        </header>
    );
};

export default Header;
