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
    const polylineRef = useRef(null);
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
                    points = gpxData;
                } else if (gpxUrl) {
                    console.log('GPX URL:', gpxUrl);
                    points = await loadGPXFromUrl(gpxUrl);
                    console.log('GPX 파싱 결과:', points);
                }
                if (!points || points.length === 0) {
                    throw new Error('트랙 포인트를 찾을 수 없습니다. (GPX 파일에 <trkpt>가 없거나 파싱 실패)');
                }
                setTrackPoints(points);
            } catch (err) {
                setError(err.message);
                if (onError) onError(err);
            } finally {
                setIsLoading(false);
            }
        };
        preloadGPXData();
    }, [gpxData, gpxUrl, onError]);

    // 카카오맵 초기화 및 경로 그리기 useEffect에서 tilesloaded 이벤트 리스너 등록/PolyLine 그리기 코드 완전 제거
    useEffect(() => {
        const loadKakaoMap = () => {
            if (window.kakao && window.kakao.maps) {
                initializeMap();
            } else {
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
            // 맵 생성 전 컨테이너 완전 초기화
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }
            let mapCenter;
            if (center) {
                mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
            } else if (trackPoints && trackPoints.length > 0) {
                const routeCenter = calculateCenter(trackPoints);
                mapCenter = new window.kakao.maps.LatLng(routeCenter.lat, routeCenter.lng);
            } else {
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
            mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, options);
            if (onMapLoad) {
                onMapLoad(mapInstanceRef.current);
            }
            // tilesloaded 이벤트에서 Polyline 그리기 완전 제거
        };
        loadKakaoMap();
        return () => {
            // 맵 언마운트 시 컨테이너 완전 초기화
            if (mapRef.current) {
                mapRef.current.innerHTML = '';
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, [trackPoints, center, level, controllable, autoFitBounds, fitBoundsOnChange, boundsPadding, routeStyle, onMapLoad, onRouteLoad]);
    
    // trackPoints 변경 시 경로 업데이트 (범위 조정 포함)
    useEffect(() => {
        if (mapInstanceRef.current && trackPoints && trackPoints.length >= 2) {
            // 기존 Polyline 제거
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
            // 새 Polyline 그리기
            const path = trackPoints.map(
                (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
            );
            const polyline = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: routeStyle.strokeWeight,
                strokeColor: routeStyle.strokeColor,
                strokeOpacity: routeStyle.strokeOpacity,
                strokeStyle: routeStyle.strokeStyle,
            });
            polyline.setMap(mapInstanceRef.current);
            polylineRef.current = polyline;
            // fitBoundsOnChange가 true인 경우에만 범위 조정
            if (fitBoundsOnChange) {
                const bounds = calculateBounds(trackPoints);
                if (bounds) {
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
                    mapInstanceRef.current.setBounds(boundsObj, boundsPadding);
                }
            }
        }
        // cleanup: Polyline 제거
        return () => {
            if (polylineRef.current) {
                polylineRef.current.setMap(null);
                polylineRef.current = null;
            }
        };
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
