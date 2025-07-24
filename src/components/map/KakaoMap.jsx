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
    
    // 코스 선택 시에만 자동 조정 (새로운 prop)
    fitBoundsOnChange = false,

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
    const [trackPoints, setTrackPoints] = useState(null);

    // GPX 데이터 미리 로드
    useEffect(() => {
        const preloadGPXData = async () => {
            if (!gpxData && !gpxUrl) {
                setTrackPoints(null);
                return;
            }

            setIsLoading(true);
            setError(null);

            try {
                let points;

                if (gpxData) {
                    // 직접 전달된 GPX 데이터 사용
                    points = gpxData;
                } else if (gpxUrl) {
                    // URL에서 GPX 파일 로드
                    points = await loadGPXFromUrl(gpxUrl);
                }

                if (!points || points.length === 0) {
                    throw new Error("트랙 포인트를 찾을 수 없습니다.");
                }

                setTrackPoints(points);
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

        preloadGPXData();
    }, [gpxData, gpxUrl, onError]);

    // 카카오맵 초기화 및 경로 그리기
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
            createMap();
        };

        const createMap = () => {
            // 중심점 결정: GPX 데이터가 있으면 경로 중심, 없으면 기본값
            let mapCenter;
            if (center) {
                mapCenter = new window.kakao.maps.LatLng(
                    center.lat,
                    center.lng
                );
            } else if (trackPoints && trackPoints.length > 0) {
                // GPX 데이터의 중심점 계산
                const routeCenter = calculateCenter(trackPoints);
                mapCenter = new window.kakao.maps.LatLng(
                    routeCenter.lat,
                    routeCenter.lng
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

            // 초기 로드 시에만 경로 그리기 (자동 범위 조정 포함)
            if (trackPoints && autoFitBounds) {
                window.kakao.maps.event.addListener(
                    mapInstanceRef.current,
                    "tilesloaded",
                    function () {
                        if (!mapInstanceRef.current._initialRouteDrawn) {
                            mapInstanceRef.current._initialRouteDrawn = true;
                            drawRouteAndAdjustBounds(true); // 초기 로드시 범위 조정
                        }
                    }
                );
            } else if (trackPoints) {
                // 초기 로드가 아닌 경우 범위 조정 없이 경로만 그리기
                window.kakao.maps.event.addListener(
                    mapInstanceRef.current,
                    "tilesloaded",
                    function () {
                        if (!mapInstanceRef.current._routeDrawn) {
                            mapInstanceRef.current._routeDrawn = true;
                            drawRoute(trackPoints);
                        }
                    }
                );
            }
        };

        const drawRouteAndAdjustBounds = (shouldFitBounds = false) => {
            if (
                !mapInstanceRef.current ||
                !trackPoints ||
                trackPoints.length < 2
            )
                return;

            // 기존 경로 제거
            if (mapInstanceRef.current._currentPolyline) {
                mapInstanceRef.current._currentPolyline.setMap(null);
            }

            // 경로 그리기
            drawRoute(trackPoints);

            // 자동 범위 조정 (초기 로드이거나 fitBoundsOnChange가 true일 때만)
            if (shouldFitBounds || fitBoundsOnChange) {
                const bounds = calculateBounds(trackPoints);
                if (bounds) {
                    adjustMapBounds(bounds);
                }
            }

            // 경로 로드 콜백
            if (onRouteLoad) {
                onRouteLoad(trackPoints);
            }
        };

        const drawRoute = (points) => {
            if (!mapInstanceRef.current || points.length < 2) return;

            // 카카오맵 좌표 배열 생성
            const path = points.map(
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
            
            // 현재 폴리라인 참조 저장 (나중에 제거하기 위해)
            mapInstanceRef.current._currentPolyline = polyline;
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
    }, [
        trackPoints,
        center,
        level,
        controllable,
        autoFitBounds,
        fitBoundsOnChange,
        boundsPadding,
        routeStyle,
        onMapLoad,
        onRouteLoad,
    ]);
    
    // trackPoints 변경 시 경로 업데이트 (범위 조정 포함)
    useEffect(() => {
        if (mapInstanceRef.current && trackPoints && trackPoints.length >= 2) {
            // 기존 경로 제거
            if (mapInstanceRef.current._currentPolyline) {
                mapInstanceRef.current._currentPolyline.setMap(null);
            }
            
            // 새 경로 그리기
            const drawRoute = (points) => {
                if (!mapInstanceRef.current || points.length < 2) return;

                // 카카오맵 좌표 배열 생성
                const path = points.map(
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
                
                // 현재 폴리라인 참조 저장 (나중에 제거하기 위해)
                mapInstanceRef.current._currentPolyline = polyline;
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
            
            drawRoute(trackPoints);
            
            // fitBoundsOnChange가 true인 경우에만 범위 조정
            if (fitBoundsOnChange) {
                const bounds = calculateBounds(trackPoints);
                if (bounds) {
                    adjustMapBounds(bounds);
                }
            }
        }
    }, [trackPoints, fitBoundsOnChange, routeStyle, boundsPadding]);

    return (
        <div
            className={`kakao-map-container ${className}`}
            style={{ width, height }}
        >
            <div ref={mapRef} className="kakao-map" />
            {isLoading && (
                <div className="loading-overlay">
                    <div className="loading-spinner">
                        경로 데이터 로딩 중...
                    </div>
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
