import React from "react";
import "./Footer.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    <h3 className="footer-title">세종 러닝</h3>
                    <p className="footer-description">
                        세종시 최고의 러닝 코스를 발견하고 함께 달려보세요
                    </p>
                </div>

                <div className="footer-section">
                    <h4 className="footer-subtitle">빠른 링크</h4>
                    <ul className="footer-links">
                        <li>
                            <a href="#home">홈</a>
                        </li>
                        <li>
                            <a href="#courses">러닝 코스</a>
                        </li>
                        <li>
                            <a href="#mypage">마이페이지</a>
                        </li>
                        <li>
                            <a href="#about">소개</a>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-subtitle">지원</h4>
                    <ul className="footer-links">
                        <li>
                            <a href="#help">도움말</a>
                        </li>
                        <li>
                            <a href="#contact">문의하기</a>
                        </li>
                        <li>
                            <a href="#privacy">개인정보처리방침</a>
                        </li>
                        <li>
                            <a href="#terms">이용약관</a>
                        </li>
                    </ul>
                </div>

                <div className="footer-section">
                    <h4 className="footer-subtitle">연락처</h4>
                    <div className="contact-info">
                        <p>📧 info@sejongrunning.kr</p>
                        <p>📞 044-123-4567</p>
                        <p>📍 세종특별자치시</p>
                    </div>
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright">
                        © {currentYear} 세종 러닝. 모든 권리 보유.
                    </p>
                    <div className="social-links">
                        <a href="#facebook" aria-label="Facebook">
                            📘
                        </a>
                        <a href="#instagram" aria-label="Instagram">
                            📷
                        </a>
                        <a href="#twitter" aria-label="Twitter">
                            🐦
                        </a>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
