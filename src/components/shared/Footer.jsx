import React from "react";
import "./Footer.css";

const Footer = () => {
    const currentYear = new Date().getFullYear();

    return (
        <footer className="footer">
            <div className="footer-content">
                <div className="footer-section">
                    {/* <h3 className="footer-title">세종 러닝</h3>
                    <p className="footer-description">
                        세종시 최고의 러닝 코스를 발견하고 함께 달려보세요
                    </p> */}
                </div>
            </div>

            <div className="footer-bottom">
                <div className="footer-bottom-content">
                    <p className="copyright">© {currentYear} 세종 러닝</p>
                    <p className="developer-info">
                        개발자: 덤앤더머 - 홍기헌 이민철
                    </p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
