import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";
import {
    loadGeoJSONFromData,
    calculateBounds,
    calculateCenter,
} from "../../utils/geoJsonParser";

const KakaoMap = ({
    // 크기 설정
    width = "100%",
    height = "100%",

    // 코스 데이터 전체
    courses = [], // [{id, geomJson, ...}]
    selectedCourseId = null,

    // 맵 설정
    level = 6, // 줌 레벨

    // 맵 조작 설정
    controllable = true, // 지도 조작 가능 여부 (드래그, 줌, 스크롤휠)

    // 경로 스타일 설정
    routeStyle = {
        strokeWeight: 4,
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
    defaultCenter = { lat: 36.4970, lng: 127.271 }, // 세종호수공원 중심
    defaultLevel = 5,
}) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const polylinesRef = useRef([]); // 여러 Polyline 관리
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState(null);

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

    // 코스 데이터 변경/선택 시 Polyline 전체 그리기 및 강조
    useEffect(() => {
        if (!mapInstanceRef.current) return;
        // 기존 Polyline 모두 제거
        polylinesRef.current.forEach((poly) => poly.setMap(null));
        polylinesRef.current = [];
        if (!courses || courses.length === 0) return;
        let selectedCenter = null;
        let selectedPolyline = null;
        courses.forEach((course) => {
            let trackPoints = null;
            try {
                console.log("[KakaoMap] course.id:", course.id, "geomJson:", course.geomJson);
                trackPoints = require("../../utils/geoJsonParser").loadGeoJSONFromData(course.geomJson);
                console.log("[KakaoMap] trackPoints:", trackPoints);
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
                console.log("[KakaoMap] 선택된 코스 중심:", selectedCenter);
            }
        });
        // ★ 선택된 Polyline을 맨 앞으로!
        if (selectedPolyline) {
            selectedPolyline.setMap(null);
            selectedPolyline.setMap(mapInstanceRef.current);
        }
        // 선택된 코스가 있으면 지도 중심 이동 → bounds로 fit
        if (selectedCourseId && selectedCenter) {
            // trackPoints에서 bounds 계산
            const selectedCourse = courses.find(c => c.id === selectedCourseId);
            let trackPoints = null;
            try {
                trackPoints = require("../../utils/geoJsonParser").loadGeoJSONFromData(selectedCourse.geomJson);
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
                // fallback: 중심 이동
                mapInstanceRef.current.setCenter(
                    new window.kakao.maps.LatLng(selectedCenter.lat, selectedCenter.lng)
                );
            }
        } else if (!selectedCourseId && courses.length > 0) {
            // 아무 코스도 선택하지 않았을 때: 직접 지정한 center/level로 이동
            mapInstanceRef.current.setCenter(
                new window.kakao.maps.LatLng(defaultCenter.lat, defaultCenter.lng)
            );
            mapInstanceRef.current.setLevel(defaultLevel);
        }
    }, [courses, selectedCourseId, routeStyle, highlightStyle]);

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
