import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./HomePage.css";
const HomePage = () => {
    const navigate = useNavigate();
    const [activeTab, setActiveTab] = useState(0);

    const handleStartRunning = () => {
        navigate("/courses");
    };

    // 세종시 대표 명소 데이터
    const sejongSpots = [
        {
            id: 0,
            name: "세종호수공원",
            description:
                "세종시의 상징적인 호수공원으로, 아름다운 호수와 함께하는 러닝을 즐길 수 있습니다.",
            image: "/pic/pic1.jpg",
            distance: "4.2km",
            difficulty: "초급",
            features: ["호수 전망", "평탄한 코스", "가족 친화적"],
        },
        {
            id: 1,
            name: "금강변 트레일",
            description:
                "자연 속에서 즐기는 트레일 러닝으로, 금강의 아름다운 풍경을 감상하며 달릴 수 있습니다.",
            image: "/pic/pic2.jpg",
            distance: "8.7km",
            difficulty: "중급",
            features: ["자연 경관", "트레일 코스", "상쾌한 공기"],
        },
        {
            id: 2,
            name: "도시공원 순환로",
            description:
                "도시 한가운데에서 즐기는 러닝으로, 세종시의 현대적인 도시 풍경을 감상할 수 있습니다.",
            image: "/pic/pic3.jpeg",
            distance: "3.1km",
            difficulty: "초급",
            features: ["도시 경관", "편리한 접근", "안전한 환경"],
        },
    ];

    // 기존 기능 상세 (하단)
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

    const handleTabChange = (index) => {
        setActiveTab(index);
    };

    return (
        <div className="homepage">
            {/* Hero Section */}
            <section className="hero-section">
                <div className="hero-background">
                    <div className="runner-illustration">
                        <img
                            src={sejongSpots[activeTab].image}
                            alt="러너들이 달리는 일러스트레이션"
                            className="background-image"
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
                    <div className="hero-text-section">
                        <div className="hero-titles">
                            <h2 className="hero-subtitle-small">
                                세종을 달리다
                            </h2>
                            <h2 className="hero-subtitle-small">
                                세종을 즐기다
                            </h2>
                            <h1 className="hero-title-main">세종 러닝</h1>
                        </div>
                        <p className="hero-subtitle">
                            세종시 최고의 러닝 플랫폼으로, 아름다운 자연과
                            함께하는 러닝은 단순한 운동이 아닌 새로운 발견의
                            여정입니다. 세종시의 숨겨진 러닝 코스를
                            탐험해보세요.
                        </p>
                        <button
                            className="cta-button"
                            onClick={handleStartRunning}
                        >
                            러닝 시작하기
                        </button>
                    </div>

                    {/* 세종시 풍경 갤러리 */}
                    <div className="sejong-gallery">
                        <div className="gallery-slider">
                            <button
                                className="slider-arrow slider-arrow-left"
                                onClick={() =>
                                    handleTabChange(
                                        (activeTab - 1 + sejongSpots.length) %
                                            sejongSpots.length
                                    )
                                }
                            >
                                ‹
                            </button>

                            <div className="slider-container">
                                <div
                                    className="slider-track"
                                    style={{
                                        transform: `translateX(-${
                                            activeTab * 100
                                        }%)`,
                                    }}
                                >
                                    {sejongSpots.map((spot, index) => (
                                        <div
                                            key={spot.id}
                                            className="slider-slide"
                                        >
                                            <div className="gallery-image">
                                                <img
                                                    src={spot.image}
                                                    alt={spot.name}
                                                />
                                                <div className="image-overlay">
                                                    <div className="spot-info">
                                                        <h3>{spot.name}</h3>
                                                        <div className="spot-stats">
                                                            <span className="stat">
                                                                <span className="stat-label">
                                                                    거리
                                                                </span>
                                                                <span className="stat-value">
                                                                    {
                                                                        spot.distance
                                                                    }
                                                                </span>
                                                            </span>
                                                            <span className="stat">
                                                                <span className="stat-label">
                                                                    난이도
                                                                </span>
                                                                <span className="stat-value">
                                                                    {
                                                                        spot.difficulty
                                                                    }
                                                                </span>
                                                            </span>
                                                            <div className="spot-features">
                                                                {spot.features.map(
                                                                    (
                                                                        feature,
                                                                        index
                                                                    ) => (
                                                                        <span
                                                                            key={
                                                                                index
                                                                            }
                                                                            className="feature-tag"
                                                                        >
                                                                            {
                                                                                feature
                                                                            }
                                                                        </span>
                                                                    )
                                                                )}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <button
                                className="slider-arrow slider-arrow-right"
                                onClick={() =>
                                    handleTabChange(
                                        (activeTab + 1) % sejongSpots.length
                                    )
                                }
                            >
                                ›
                            </button>
                        </div>
                        
                        <div className="slider-dots">
                            {sejongSpots.map((spot, index) => (
                                <button
                                    key={spot.id}
                                    className={`slider-dot ${
                                        activeTab === index ? "active" : ""
                                    }`}
                                    onClick={() => handleTabChange(index)}
                                />
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            {/* Feature Boxes Section */}
            <section className="feature-section">
                <div className="feature-content">
                    <h2 className="feature-title">주요 기능</h2>
                    <p className="feature-subtitle">
                        세종러닝이 제공하는 다양한 기능들을 확인해보세요. 러닝을
                        더욱 즐겁고 효율적으로 만들어드립니다.
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
