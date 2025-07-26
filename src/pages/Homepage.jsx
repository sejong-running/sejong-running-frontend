import React from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";

const HomePage = () => {
    const navigate = useNavigate();

    const handleStartRunning = () => {
        navigate("/courses");
    };

    const features = [
        {
            icon: "🏃‍♂️",
            title: "다양한 러닝 코스",
            description:
                "세종시의 다양한 러닝 코스를 발견하고 새로운 경험을 시작하세요.",
        },
        {
            icon: "🗺️",
            title: "실시간 지도",
            description:
                "카카오맵 기반의 정확한 경로 안내와 실시간 위치 추적을 제공합니다.",
        },
        {
            icon: "📊",
            title: "상세한 기록",
            description:
                "러닝 시간, 거리, 칼로리 등 상세한 운동 기록을 관리하세요.",
        },
        {
            icon: "❤️",
            title: "즐겨찾기",
            description:
                "마음에 드는 코스를 즐겨찾기에 추가하고 빠르게 접근하세요.",
        },
        {
            icon: "🏆",
            title: "개인 기록",
            description:
                "개인 최고 기록을 달성하고 지속적인 동기부여를 받으세요.",
        },
        {
            icon: "📱",
            title: "모바일 최적화",
            description:
                "모든 디바이스에서 완벽하게 작동하는 반응형 디자인입니다.",
        },
    ];

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="runner-illustration">
                        <img
                            src="/homeimage2.jpg"
                            alt="러너들이 달리는 일러스트레이션"
                        />
                    </div>
                    <div className="floating-shapes">
                        <div className="shape shape-1"></div>
                        <div className="shape shape-2"></div>
                        <div className="shape shape-3"></div>
                    </div>
                    <div className="gradient-wave"></div>
                </div>

                <div className="hero-content">
                    <h1 className="hero-title">세종시 최고의 러닝 경험</h1>
                    <p className="hero-subtitle">
                        아름다운 자연과 함께하는 러닝은 단순한 운동이 아닌
                        새로운 발견의 여정입니다. 세종시의 숨겨진 러닝 코스를
                        탐험해보세요.
                    </p>
                    <button className="cta-button" onClick={handleStartRunning}>
                        러닝 시작하기
                    </button>

                    {/* Dashboard Mockup */}
                    <div className="dashboard-mockup">
                        <div className="mockup-header">
                            <div className="mockup-tabs">
                                <div className="tab active">코스 목록</div>
                                <div className="tab">지도 보기</div>
                                <div className="tab">내 기록</div>
                            </div>
                        </div>
                        <div className="mockup-content">
                            <div className="mockup-left">
                                <div className="mockup-item">
                                    <div className="checkbox"></div>
                                    <span>세종호수공원 코스</span>
                                </div>
                                <div className="mockup-item">
                                    <div className="checkbox"></div>
                                    <span>한강둔치 코스</span>
                                </div>
                                <div className="mockup-item">
                                    <div className="checkbox"></div>
                                    <span>도시공원 코스</span>
                                </div>
                            </div>
                            <div className="mockup-center">
                                <div className="progress-circle">
                                    <div className="progress-fill"></div>
                                    <span className="progress-text">75%</span>
                                </div>
                            </div>
                            <div className="mockup-right">
                                <div className="user-avatar">
                                    <div className="avatar"></div>
                                    <div className="user-info">
                                        <span className="user-name">
                                            러너님
                                        </span>
                                        <span className="user-status">
                                            오늘 5km 완주!
                                        </span>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="mockup-bottom">
                            <div className="chart-container">
                                <div
                                    className="chart-bar"
                                    style={{ height: "60%" }}
                                ></div>
                                <div
                                    className="chart-bar"
                                    style={{ height: "80%" }}
                                ></div>
                                <div
                                    className="chart-bar"
                                    style={{ height: "40%" }}
                                ></div>
                                <div
                                    className="chart-bar"
                                    style={{ height: "90%" }}
                                ></div>
                                <div
                                    className="chart-bar"
                                    style={{ height: "70%" }}
                                ></div>
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Boxes Section */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">주요 기능</h2>
                    <p className="feature-subtitle">
                        아름다운 자연과 함께하는 러닝은 단순한 운동이 아닌
                        새로운 발견의 여정입니다. 세종시의 숨겨진 러닝 코스를
                        탐험해보세요.
                    </p>

                    <div className="feature-grid">
                        {features.map((feature, index) => (
                            <div key={index} className="feature-box">
                                <div className="feature-icon">
                                    {feature.icon}
                                </div>
                                <h3 className="feature-box-title">
                                    {feature.title}
                                </h3>
                                <p className="feature-description">
                                    {feature.description}
                                </p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>
        </div>
    );
};

export default HomePage;
