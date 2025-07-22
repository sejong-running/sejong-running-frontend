import React, { useEffect, useRef } from "react";
import "./KakaoMap.css";

const KakaoMap = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);

    useEffect(() => {
        const loadKakaoMap = () => {
            if (window.kakao && window.kakao.maps) {
                initializeMap();
            } else {
                // 카카오맵 API 스크립트가 로드되지 않은 경우
                const script = document.createElement("script");
                script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
                script.async = true;
                script.onload = () => {
                    window.kakao.maps.load(() => {
                        initializeMap();
                    });
                };
                document.head.appendChild(script);
            }
        };

        const initializeMap = () => {
            const options = {
                center: new window.kakao.maps.LatLng(37.5665, 126.978), // 서울 시청
                level: 3,
            };

            mapInstanceRef.current = new window.kakao.maps.Map(
                mapRef.current,
                options
            );
        };

        loadKakaoMap();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, []);

    return (
        <div className="kakao-map-container">
            <div ref={mapRef} className="kakao-map" />
        </div>
    );
};

export default KakaoMap;
