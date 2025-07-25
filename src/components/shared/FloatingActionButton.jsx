import React, { useState, useEffect } from "react";
import { useTheme } from "../../contexts/ThemeContext";
import "./FloatingActionButton.css";

const FloatingActionButton = () => {
    const { theme, toggleTheme, isDark } = useTheme();
    const [isVisible, setIsVisible] = useState(false);
    const [isAtTop, setIsAtTop] = useState(true);

    // 스크롤 위치 감지
    useEffect(() => {
        const handleScroll = () => {
            const scrollTop = window.pageYOffset || document.documentElement.scrollTop;
            setIsAtTop(scrollTop < 50); // 50px 이하일 때 최상단으로 간주
        };

        // 초기 상태 설정
        handleScroll();

        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    // 스크롤 이동 함수
    const handleScrollAction = () => {
        if (isAtTop) {
            // 최상단일 때는 최하단으로 이동
            const scrollHeight = document.documentElement.scrollHeight;
            const clientHeight = document.documentElement.clientHeight;
            window.scrollTo({
                top: scrollHeight - clientHeight,
                behavior: "smooth",
            });
        } else {
            // 최상단이 아닐 때는 최상단으로 이동
            window.scrollTo({
                top: 0,
                behavior: "smooth",
            });
        }
    };

    // 버튼 표시/숨김 애니메이션
    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1000);
        return () => clearTimeout(timer);
    }, []);

    return (
        <div className={`floating-action-container ${isVisible ? "visible" : ""}`}>
            {/* 스크롤 이동 버튼 */}
            <button
                className={`floating-action-button scroll-action ${isAtTop ? "flip-rocket" : ""}`}
                onClick={handleScrollAction}
                aria-label={isAtTop ? "페이지 최하단으로 이동" : "페이지 최상단으로 이동"}
                title={isAtTop ? "페이지 최하단으로 이동" : "페이지 최상단으로 이동"}
            >
                🚀
            </button>

            {/* 테마 토글 버튼 */}
            <button
                className="floating-action-button theme-toggle"
                onClick={toggleTheme}
                aria-label={`${isDark ? "라이트" : "다크"} 모드로 변경`}
                title={`${isDark ? "라이트" : "다크"} 모드로 변경`}
            >
                {isDark ? "☀️" : "🌙"}
            </button>
        </div>
    );
};

export default FloatingActionButton; 