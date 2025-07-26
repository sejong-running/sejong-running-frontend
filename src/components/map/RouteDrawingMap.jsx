import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";

const RouteDrawingMap = React.forwardRef(({
    width = "100%",
    height = "400px",
    onRouteChange = null,
    initialRoutePoints = [],
    center = { lat: 36.503, lng: 127.282 },
    level = 6,
    className = ""
}, ref) => {
    const mapRef = useRef(null);
    const mapInstanceRef = useRef(null);
    const markersRef = useRef([]);
    const polylineRef = useRef(null);
    const [routePoints, setRoutePoints] = useState(initialRoutePoints);

    useEffect(() => {
        initializeMap();
        return () => {
            cleanup();
        };
    }, []);

    useEffect(() => {
        if (routePoints.length > 0) {
            drawRoute();
        } else {
            // routePoints가 비어있으면 지도에서 모든 그리기 요소 제거
            clearDrawings();
        }
        if (onRouteChange) {
            onRouteChange(routePoints);
        }
    }, [routePoints]);

    const initializeMap = () => {
        if (window.kakao && window.kakao.maps) {
            createMap();
        } else {
            const script = document.createElement("script");
            script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${process.env.REACT_APP_KAKAO_MAP_API_KEY}&autoload=false`;
            script.async = true;
            script.onload = () => {
                window.kakao.maps.load(() => {
                    createMap();
                });
            };
            document.head.appendChild(script);
        }
    };

    const createMap = () => {
        if (!mapRef.current) return;

        const mapCenter = new window.kakao.maps.LatLng(center.lat, center.lng);
        const options = {
            center: mapCenter,
            level: level,
            draggable: true,
            zoomable: true,
            scrollwheel: true,
        };

        mapInstanceRef.current = new window.kakao.maps.Map(mapRef.current, options);

        window.kakao.maps.event.addListener(mapInstanceRef.current, 'click', handleMapClick);
    };

    const handleMapClick = (mouseEvent) => {
        const latlng = mouseEvent.latLng;
        const newPoint = {
            lat: latlng.getLat(),
            lng: latlng.getLng()
        };

        setRoutePoints(prev => [...prev, newPoint]);
    };

    const drawRoute = () => {
        clearDrawings();

        routePoints.forEach((point, index) => {
            const position = new window.kakao.maps.LatLng(point.lat, point.lng);
            
            const marker = new window.kakao.maps.Marker({
                position: position,
                map: mapInstanceRef.current
            });


            window.kakao.maps.event.addListener(marker, 'rightclick', () => {
                removePoint(index);
            });

            markersRef.current.push(marker);
        });

        if (routePoints.length > 1) {
            const path = routePoints.map(point => 
                new window.kakao.maps.LatLng(point.lat, point.lng)
            );

            polylineRef.current = new window.kakao.maps.Polyline({
                path: path,
                strokeWeight: 4,
                strokeColor: '#FF0000',
                strokeOpacity: 0.8,
                strokeStyle: 'solid'
            });

            polylineRef.current.setMap(mapInstanceRef.current);
        }
    };

    const removePoint = (index) => {
        setRoutePoints(prev => prev.filter((_, i) => i !== index));
    };

    const clearDrawings = () => {
        markersRef.current.forEach(marker => marker.setMap(null));
        markersRef.current = [];

        if (polylineRef.current) {
            polylineRef.current.setMap(null);
            polylineRef.current = null;
        }
    };

    const clearAllPoints = () => {
        setRoutePoints([]);
        clearDrawings();
        if (onRouteChange) {
            onRouteChange([]);
        }
    };

    // 외부에서 clearAllPoints 사용할 수 있도록 노출
    React.useImperativeHandle(ref, () => ({
        clearAllPoints,
        resetMap: () => {
            // 지도 중심을 초기 위치로 재설정
            if (mapInstanceRef.current) {
                const mapCenter = new window.kakao.maps.LatLng(36.503, 127.282);
                mapInstanceRef.current.setCenter(mapCenter);
                mapInstanceRef.current.setLevel(6);
            }
            clearAllPoints();
        }
    }), []);

    const cleanup = () => {
        clearDrawings();
        if (mapInstanceRef.current) {
            mapInstanceRef.current = null;
        }
    };

    return (
        <div className={`route-drawing-map-container ${className}`}>
            <div 
                ref={mapRef} 
                className="kakao-map"
                style={{ width, height }}
            />
        </div>
    );
});

export default RouteDrawingMap;