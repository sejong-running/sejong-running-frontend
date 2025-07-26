import React, { useEffect, useRef, useState } from "react";
import "./KakaoMap.css";

const RouteDrawingMap = ({
    width = "100%",
    height = "400px",
    onRouteChange = null,
    initialRoutePoints = [],
    center = { lat: 36.503, lng: 127.282 },
    level = 6,
    className = ""
}) => {
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

            const infoWindow = new window.kakao.maps.InfoWindow({
                content: `<div style="padding:5px; font-size:12px;">점 ${index + 1}</div>`
            });

            window.kakao.maps.event.addListener(marker, 'mouseover', () => {
                infoWindow.open(mapInstanceRef.current, marker);
            });

            window.kakao.maps.event.addListener(marker, 'mouseout', () => {
                infoWindow.close();
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
    };

    const undoLastPoint = () => {
        setRoutePoints(prev => prev.slice(0, -1));
    };

    const cleanup = () => {
        clearDrawings();
        if (mapInstanceRef.current) {
            mapInstanceRef.current = null;
        }
    };

    return (
        <div className={`route-drawing-map-container ${className}`}>
            <div className="map-controls" style={{ marginBottom: '10px' }}>
                <button 
                    onClick={undoLastPoint}
                    disabled={routePoints.length === 0}
                    style={{
                        marginRight: '10px',
                        padding: '5px 10px',
                        backgroundColor: '#ffc107',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: routePoints.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    마지막 점 삭제
                </button>
                <button 
                    onClick={clearAllPoints}
                    disabled={routePoints.length === 0}
                    style={{
                        padding: '5px 10px',
                        backgroundColor: '#dc3545',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: routePoints.length === 0 ? 'not-allowed' : 'pointer'
                    }}
                >
                    모두 지우기
                </button>
                <span style={{ marginLeft: '15px', fontSize: '14px', color: '#666' }}>
                    점 개수: {routePoints.length}
                </span>
            </div>
            <div 
                ref={mapRef} 
                className="kakao-map"
                style={{ width, height }}
            />
            <div className="map-instructions" style={{ marginTop: '10px', fontSize: '12px', color: '#666' }}>
                • 지도를 클릭하여 경로 점을 추가하세요<br/>
                • 마커를 우클릭하면 해당 점이 삭제됩니다
            </div>
        </div>
    );
};

export default RouteDrawingMap;