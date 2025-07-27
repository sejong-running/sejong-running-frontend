import React, { useState, useRef, useEffect } from "react";
import "./ImageSlider.css";

const ImageSlider = ({ images, onClose }) => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isLoading, setIsLoading] = useState(true);
    const sliderRef = useRef(null);

    useEffect(() => {
        if (images.length > 0) {
            setIsLoading(false);
        }
    }, [images]);

    const nextImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === images.length - 1 ? 0 : prevIndex + 1
        );
    };

    const prevImage = () => {
        setCurrentIndex((prevIndex) =>
            prevIndex === 0 ? images.length - 1 : prevIndex - 1
        );
    };

    const goToImage = (index) => {
        setCurrentIndex(index);
    };

    const handleKeyDown = (e) => {
        if (e.key === "ArrowLeft") {
            prevImage();
        } else if (e.key === "ArrowRight") {
            nextImage();
        } else if (e.key === "Escape") {
            onClose();
        }
    };

    useEffect(() => {
        document.addEventListener("keydown", handleKeyDown);
        return () => {
            document.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    if (isLoading) {
        return (
            <div className="image-slider">
                <div className="image-slider__loading">
                    <div className="loading-spinner"></div>
                    <p>이미지를 불러오는 중...</p>
                </div>
            </div>
        );
    }

    if (images.length === 0) {
        return (
            <div className="image-slider">
                <div className="image-slider__empty">
                    <p>이미지가 없습니다.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="image-slider" ref={sliderRef}>
            {/* 닫기 버튼 */}
            <button className="image-slider__close" onClick={onClose}>
                ✕
            </button>

            {/* 이미지 컨테이너 */}
            <div className="image-slider__container">
                <img
                    src={images[currentIndex]?.url}
                    alt={`코스 이미지 ${currentIndex + 1}`}
                    className="image-slider__image"
                    onLoad={() => setIsLoading(false)}
                />
            </div>

            {/* 네비게이션 버튼 */}
            {images.length > 1 && (
                <>
                    <button
                        className="image-slider__nav image-slider__nav--prev"
                        onClick={prevImage}
                        aria-label="이전 이미지"
                    >
                        ‹
                    </button>
                    <button
                        className="image-slider__nav image-slider__nav--next"
                        onClick={nextImage}
                        aria-label="다음 이미지"
                    >
                        ›
                    </button>
                </>
            )}

            {/* 인디케이터 */}
            {images.length > 1 && (
                <div className="image-slider__indicators">
                    {images.map((_, index) => (
                        <button
                            key={index}
                            className={`image-slider__indicator ${
                                index === currentIndex ? "active" : ""
                            }`}
                            onClick={() => goToImage(index)}
                            aria-label={`이미지 ${index + 1}로 이동`}
                        />
                    ))}
                </div>
            )}

            {/* 이미지 정보 */}
            <div className="image-slider__info">
                <span className="image-slider__counter">
                    {currentIndex + 1} / {images.length}
                </span>
                <span className="image-slider__filename">
                    {images[currentIndex]?.name}
                </span>
            </div>
        </div>
    );
};

export default ImageSlider;
