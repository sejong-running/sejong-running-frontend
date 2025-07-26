import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";
import {
    loadGeoJSONFromData,
} from "../../utils/geoJsonParser";

const KakaoMap = ({
    // 크기 설정
    width = "100%",
    height = "100%",

    // 경로 데이터 - 단일 경로 또는 다중 경로 지원
    geomJson = null, // 단일 경로용
    courses = [], // 다중 경로용 [{id, geomJson, ...}]
    selectedCourseId = null,

    // 맵 설정
    level = 6, // 줌 레벨
    center = null, // 중심 좌표 {lat, lng}
    bounds = null, // 바운드 {minLat, maxLat, minLng, maxLng}

    // 맵 조작 설정
    controllable = true, // 지도 조작 가능 여부 (드래그, 줌, 스크롤휠)

    // 경로 스타일 설정
    routeStyle = {
        strokeWeight: 6,
        strokeColor: "#7C4DFF", // 조금 더 진한 연보라
        strokeOpacity: 0.2,     // 반투명 효과
        strokeStyle: "solid",
    },
    // 강조 스타일
    highlightStyle = {
        strokeWeight: 4,
        strokeColor: "#7C4DFF", // 진한 보라
        strokeOpacity: 1,
        strokeStyle: "solid",
    },

    // 자동 범위 조정
    boundsPadding = 100,
    fitBoundsOnChange = false,

    // 콜백 함수
    onMapLoad = null,
    onError = null,

    // 추가 클래스명
    className = "",
    defaultCenter = { lat: 36.4970, lng: 127.278 }, // 세종호수공원 중심
    defaultLevel = 5,
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylinesRef = useRef([]); // 여러 Polyline 관리

    // 카카오맵 인스턴스 생성 useEffect: 최초 1회만 실행
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
            if (mapRef.current) {
                mapRef.current.innerHTML = "";
            }
            let mapCenter = new window.kakao.maps.LatLng(36.503, 127.282);
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
            if (onMapLoad) {
                onMapLoad(mapInstanceRef.current);
            }
        };
        loadKakaoMap();
        return () => {
            if (mapRef.current) {
                mapRef.current.innerHTML = "";
            }
            if (mapInstanceRef.current) {
                mapInstanceRef.current = null;
            }
        };
    }, []);

    // 경로 데이터 변경 시 Polyline 그리기
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        
        // 기존 Polyline 모두 제거
        polylinesRef.current.forEach((poly) => poly.setMap(null));
        polylinesRef.current = [];

        // 단일 경로 데이터 처리
        if (geomJson) {
            drawSingleRoute(geomJson);
        }
        // 다중 경로 데이터 처리
        else if (courses && courses.length > 0) {
            drawMultipleRoutes();
        }
    }, [geomJson, courses, selectedCourseId, routeStyle, highlightStyle, center, bounds]);

    // 단일 경로 그리기 함수
    const drawSingleRoute = (geoJsonData) => {
        let trackPoints = null;
        try {
            trackPoints = loadGeoJSONFromData(geoJsonData);
        } catch (err) {
            console.error("[KakaoMap] GeoJSON 파싱 에러:", err);
            if (onError) onError(err);
            return;
        }

        if (!trackPoints || trackPoints.length < 2) return;

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
        polylinesRef.current.push(polyline);

        // 지도 중심 및 범위 설정
        setMapViewForSingleRoute(trackPoints);
    };

    // 다중 경로 그리기 함수
    const drawMultipleRoutes = () => {
        let selectedCenter = null;
        let selectedPolyline = null;
        
        courses.forEach((course) => {
            let trackPoints = null;
            try {
                trackPoints = loadGeoJSONFromData(course.geomJson);
            } catch (err) {
                console.error("[KakaoMap] GeoJSON 파싱 에러:", err);
            }
            if (!trackPoints || trackPoints.length < 2) return;
            
            const path = trackPoints.map(
                (point) => new window.kakao.maps.LatLng(point.lat, point.lng)
            );
            
            // 선택된 코스만 강조 스타일 적용
            const isSelected = course.id === selectedCourseId;
            const style = isSelected ? highlightStyle : routeStyle;
            const polyline = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: style.strokeWeight,
                strokeColor: style.strokeColor,
                strokeOpacity: style.strokeOpacity,
                strokeStyle: style.strokeStyle,
            });
            polyline.setMap(mapInstanceRef.current);
            polylinesRef.current.push(polyline);
            
            if (isSelected) {
                selectedPolyline = polyline;
                const lats = trackPoints.map((p) => p.lat);
                const lngs = trackPoints.map((p) => p.lng);
                selectedCenter = {
                    lat: (Math.min(...lats) + Math.max(...lats)) / 2,
                    lng: (Math.min(...lngs) + Math.max(...lngs)) / 2,
                };
            }
        });
        
        // 선택된 Polyline을 맨 앞으로
        if (selectedPolyline) {
            selectedPolyline.setMap(null);
            selectedPolyline.setMap(mapInstanceRef.current);
        }
        
        // 지도 중심 설정
        setMapViewForMultipleRoutes(selectedCenter);
    };

    // 단일 경로용 지도 뷰 설정
    const setMapViewForSingleRoute = (trackPoints) => {
        if (bounds) {
            // bounds가 제공된 경우
            const swLatLng = new window.kakao.maps.LatLng(bounds.minLat, bounds.minLng);
            const neLatLng = new window.kakao.maps.LatLng(bounds.maxLat, bounds.maxLng);
            const boundsObj = new window.kakao.maps.LatLngBounds(swLatLng, neLatLng);
            mapInstanceRef.current.setBounds(boundsObj, boundsPadding);
        } else if (center) {
            // center가 제공된 경우
            mapInstanceRef.current.setCenter(
                new window.kakao.maps.LatLng(center.lat, center.lng)
            );
            mapInstanceRef.current.setLevel(level);
        } else if (fitBoundsOnChange && trackPoints.length > 1) {
            // 자동 범위 조정
            const lats = trackPoints.map((p) => p.lat);
            const lngs = trackPoints.map((p) => p.lng);
            const swLatLng = new window.kakao.maps.LatLng(Math.min(...lats), Math.min(...lngs));
            const neLatLng = new window.kakao.maps.LatLng(Math.max(...lats), Math.max(...lngs));
            const boundsObj = new window.kakao.maps.LatLngBounds(swLatLng, neLatLng);
            mapInstanceRef.current.setBounds(boundsObj, boundsPadding);
        }
    };

    // 다중 경로용 지도 뷰 설정
    const setMapViewForMultipleRoutes = (selectedCenter) => {
        if (selectedCourseId && selectedCenter) {
            // 선택된 코스가 있으면 해당 코스에 맞춰 범위 조정
            const selectedCourse = courses.find(c => c.id === selectedCourseId);
            let trackPoints = null;
            try {
                trackPoints = loadGeoJSONFromData(selectedCourse.geomJson);
            } catch (err) {
                // 무시
            }
            if (trackPoints && trackPoints.length > 1) {
                const lats = trackPoints.map((p) => p.lat);
                const lngs = trackPoints.map((p) => p.lng);
                const swLatLng = new window.kakao.maps.LatLng(Math.min(...lats), Math.min(...lngs));
                const neLatLng = new window.kakao.maps.LatLng(Math.max(...lats), Math.max(...lngs));
                const boundsObj = new window.kakao.maps.LatLngBounds(swLatLng, neLatLng);
                mapInstanceRef.current.setBounds(boundsObj, boundsPadding);
            } else {
                mapInstanceRef.current.setCenter(
                    new window.kakao.maps.LatLng(selectedCenter.lat, selectedCenter.lng)
                );
            }
        } else if (!selectedCourseId && courses.length > 0) {
            // 아무 코스도 선택하지 않았을 때: 기본 중심으로 이동
            mapInstanceRef.current.setCenter(
                new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng)
            );
            mapInstanceRef.current.setLevel(defaultLevel);
        }
    };

    return (
        <div
            className={`kakao-map-container ${className}`}
            style={{ width, height }}
        >
            <div ref={mapRef} className="kakao-map" />
        </div>
    );
};

export default KakaoMap;
