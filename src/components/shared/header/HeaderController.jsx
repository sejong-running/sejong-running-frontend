import React from "react";
import { Link, useLocation } from "react-router-dom";
import "./HeaderController.css";
import UserSelector from "./UserSelector";

const Header = () => {
    const location = useLocation();

    const isActive = (path) => {
        return location.pathname === path;
    };
    return (
        <header className="header">
            <div className="header-content">
                {/* 왼쪽: 브랜드 섹션 */}
                <div className="header-left">
                    <Link to="/" className="brand-section">
                        <img
                            src="/icons/banner_2.png"
                            alt="Sejong Running"
                            className="brand-logo"
                            style={{ height: "60px" }}
                        />
                    </Link>
                </div>

                {/* 오른쪽: 네비게이션과 사용자 선택기 */}
                <div className="header-right">
                    <nav className="nav-links">
                        <Link
                            to="/courses"
                            className={`nav-link ${
                                isActive("/courses") ? "active" : ""
                            }`}
                        >
                            러닝 코스
                        </Link>
                        <Link
                            to="/recommend"
                            className={`nav-link ${
                                isActive("/recommend") ? "active" : ""
                            }`}
                        >
                            추천 코스
                        </Link>
                        <Link
                            to="/mypage"
                            className={`nav-link ${
                                isActive("/mypage") ? "active" : ""
                            }`}
                        >
                            나의 코스
                        </Link>
                    </nav>
                    <div className="header-user">
                        <UserSelector />
                    </div>
                </div>
            </div>
        </header>
    );
};

export default Header;
