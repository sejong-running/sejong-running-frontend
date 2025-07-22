import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";
import { loadGPXFromUrl, calculateBounds } from "../utils/gpxParser";

const KakaoMap = () => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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
                center: new window.kakao.maps.LatLng(36.498303, 127.271097), // GPX 시작점
                level: 3,
            };

            mapInstanceRef.current = new window.kakao.maps.Map(
                mapRef.current,
                options
            );

            // 맵 초기화 후 GPX 로드
            loadGPXRoute();
        };

        const loadGPXRoute = async () => {
            setIsLoading(true);
            setError(null);

            try {
                // GPX 파일 로드 및 파싱
                const trackPoints = await loadGPXFromUrl("/gpx/route_0.gpx");

                if (trackPoints.length === 0) {
                    throw new Error("트랙 포인트를 찾을 수 없습니다.");
                }

                // 경로 그리기
                drawRoute(trackPoints);

                // 경계 계산하여 맵 범위 조정
                const bounds = calculateBounds(trackPoints);
                if (bounds) {
                    adjustMapBounds(bounds);
                }
            } catch (err) {
                console.error("GPX 로드 에러:", err);
                setError(err.message);
            } finally {
                setIsLoading(false);
            }
        };

        const drawRoute = (trackPoints) => {
            if (!mapInstanceRef.current || trackPoints.length < 2) return;

            // 카카오맵 좌표 배열 생성
            const path = trackPoints.map(
                (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
            );

            // 폴리라인 생성
            const polyline = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: 8,
                strokeColor: "#4A90E2",
                strokeOpacity: 0.6,
                strokeStyle: "solid",
            });

            // 지도에 경로 추가
            polyline.setMap(mapInstanceRef.current);
        };

        const adjustMapBounds = (bounds) => {
            if (!mapInstanceRef.current) return;

            const swLatLng = new window.kakao.maps.LatLng(
                bounds.minLat,
                bounds.minLng
            );
            const neLatLng = new window.kakao.maps.LatLng(
                bounds.maxLat,
                bounds.maxLng
            );
            const boundsObj = new window.kakao.maps.LatLngBounds(
                swLatLng,
                neLatLng
            );

            // 경로가 모두 보이도록 맵 범위 조정
            mapInstanceRef.current.setBounds(boundsObj, 50); // 50px 여백
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
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">GPX 경로 로딩 중...</div>
                </div>
            )}
            {error && (
                <div className="error-overlay">
                    <div className="error-message">에러: {error}</div>
                </div>
            )}
        </div>
    );
};

export default KakaoMap;
