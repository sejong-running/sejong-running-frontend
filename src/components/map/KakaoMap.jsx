import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";
import {
    loadGPXFromUrl,
    calculateBounds,
    calculateCenter,
} from "../../utils/gpxParser";

const KakaoMap = ({
    // 크기 설정
    width = "100%",
    height = "100%",

    // GPX 데이터 설정
    gpxData = null, // 직접 GPX 데이터 배열
    gpxUrl = null, // GPX 파일 URL

    // 맵 설정
    center = null, // {lat, lng}
    level = 4, // 줌 레벨

    // 맵 조작 설정
    controllable = true, // 지도 조작 가능 여부 (드래그, 줌, 스크롤휠)

    // 경로 스타일 설정
    routeStyle = {
        strokeWeight: 8,
        strokeColor: "#4A90E2",
        strokeOpacity: 0.6,
        strokeStyle: "solid",
    },

    // 자동 범위 조정
    autoFitBounds = true,
    boundsPadding = 100,

    // 콜백 함수
    onMapLoad = null,
    onRouteLoad = null,
    onError = null,

    // 추가 클래스명
    className = "",
}) => {
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
            // 맵 생성
            createMap();
        };

        const createMap = () => {
            // 기본 중심점 설정
            let mapCenter;
            if (center) {
                mapCenter = new window.kakao.maps.LatLng(
                    center.lat,
                    center.lng
                );
            } else {
                // 기본값: 세종시 중심
                mapCenter = new window.kakao.maps.LatLng(36.487, 127.282);
            }

            const options = {
                center: mapCenter,
                level: level,
                draggable: controllable,
                zoomable: controllable,
                scrollwheel: controllable,
                disableDoubleClickZoom: !controllable,
            };

            mapInstanceRef.current = new window.kakao.maps.Map(
                mapRef.current,
                options
            );

            // 맵 로드 콜백
            if (onMapLoad) {
                onMapLoad(mapInstanceRef.current);
            }

            // 맵이 완전히 로드된 후 GPX 데이터 로드
            window.kakao.maps.event.addListener(
                mapInstanceRef.current,
                "tilesloaded",
                function () {
                    // GPX 데이터 로드 (한 번만 실행되도록)
                    if (!mapInstanceRef.current._gpxLoaded) {
                        mapInstanceRef.current._gpxLoaded = true;
                        loadGPXData();
                    }
                }
            );
        };

        const loadGPXData = async () => {
            if (!gpxData && !gpxUrl) return;

            setIsLoading(true);
            setError(null);

            try {
                let trackPoints;

                if (gpxData) {
                    // 직접 전달된 GPX 데이터 사용
                    trackPoints = gpxData;
                } else if (gpxUrl) {
                    // URL에서 GPX 파일 로드
                    trackPoints = await loadGPXFromUrl(gpxUrl);
                }

                if (!trackPoints || trackPoints.length === 0) {
                    throw new Error("트랙 포인트를 찾을 수 없습니다.");
                }

                // 경로 그리기
                drawRoute(trackPoints);

                // 자동 범위 조정 (옵션)
                if (autoFitBounds) {
                    const bounds = calculateBounds(trackPoints);
                    if (bounds) {
                        adjustMapBounds(bounds);
                    }
                }

                // 경로 로드 콜백
                if (onRouteLoad) {
                    onRouteLoad(trackPoints);
                }
            } catch (err) {
                console.error("GPX 로드 에러:", err);
                setError(err.message);
                if (onError) {
                    onError(err);
                }
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

            // 폴리라인 생성 (커스텀 스타일 적용)
            const polyline = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: routeStyle.strokeWeight,
                strokeColor: routeStyle.strokeColor,
                strokeOpacity: routeStyle.strokeOpacity,
                strokeStyle: routeStyle.strokeStyle,
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
            mapInstanceRef.current.setBounds(boundsObj, boundsPadding);
        };

        loadKakaoMap();

        // 컴포넌트 언마운트 시 정리
        return () => {
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [gpxData, gpxUrl, center, level, autoFitBounds, boundsPadding]);

    return (
        <div
            className={`kakao-map-container ${className}`}
            style={{ width, height }}
        >
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
