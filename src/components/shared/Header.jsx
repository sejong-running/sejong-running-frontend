import React from "react";
import { Link } from "react-router-dom";
import "./Header.css";

const Header = () => {
    return (
        <header className="header">
            <div className="header-content">
                {/* 왼쪽: 빨간색 리본 로고 + 검은색 배경 브랜드명 */}
                <div className="header-left">
                    <Link to="/" className="brand-section">
                        <div className="brand-name">
                            <div className="brand-line-1">Sejong</div>
                            <div className="brand-line-2">RUNNING</div>
                        </div>
                    </Link>
                </div>

                {/* 중앙: 네비게이션 링크 */}
                <div className="header-center">
                    <nav className="nav-links">
                        <Link to="/courses" className="nav-link">
                            러닝 코스
                        </Link>
                        <Link to="/mypage" className="nav-link">
                            내 기록
                        </Link>
                    </nav>
                </div>
            </div>
        </header>
    );
};

export default Header;
