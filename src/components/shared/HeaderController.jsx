import React, { useState } from "react";
import { Link } from "react-router-dom";
import "./HeaderController.css";
import UserSelector from "./UserSelector";

const Header = () => {
    const [searchQuery, setSearchQuery] = useState("");

    const handleSearch = (e) => {
        e.preventDefault();
        // 검색 로직 구현
        console.log("검색어:", searchQuery);
    };

    return (
        <header className="header">
            <div className="header-content">
                {/* 왼쪽: 브랜드 섹션 */}
                <div className="header-left">
                    <Link to="/" className="brand-section">
                        <div className="brand-name">
                            <div className="brand-line-1">Sejong</div>
                            <div className="brand-line-2">RUNNING</div>
                        </div>
                    </Link>
                </div>

                {/* 중앙: 검색 컴포넌트 */}
                <div className="header-center">
                    <form className="search-container" onSubmit={handleSearch}>
                        <input
                            type="text"
                            placeholder="러닝 코스를 검색해보세요..."
                            className="search-input"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                        <button type="submit" className="search-button">
                            🔍
                        </button>
                    </form>
                </div>

                {/* 오른쪽: 네비게이션 링크 */}
                <div className="header-right">
                    <nav className="nav-links">
                        <Link to="/courses" className="nav-link">
                            러닝 코스
                        </Link>
                        <Link to="/mypage" className="nav-link">
                            내 기록
                        </Link>
                    </nav>
                </div>

                {/* 맨 오른쪽: 사용자 선택기 */}
                <div className="header-user">
                    <UserSelector />
                </div>
            </div>
        </header>
    );
};

export default Header;
