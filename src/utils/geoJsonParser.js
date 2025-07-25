/**
 * GeoJSON 데이터를 파싱하여 트랙 포인트 데이터를 추출하는 유틸리티
 */

/**
 * GeoJSON LineString 객체를 파싱하여 트랙 포인트 배열을 반환
 * @param {Object} geoJson - GeoJSON LineString 객체
 * @returns {Array} 트랙 포인트 배열 [{lat, lng}, ...]
 */
const parseGeoJSON = (geoJson) => {
    try {
        if (!geoJson || geoJson.type !== 'LineString') {
            throw new Error('유효한 LineString GeoJSON 객체가 아닙니다.');
        }

        const coordinates = geoJson.coordinates;
        if (!Array.isArray(coordinates) || coordinates.length === 0) {
            throw new Error('좌표 데이터가 없습니다.');
        }

        const trackPoints = coordinates.map(coord => {
            if (!Array.isArray(coord) || coord.length < 2) {
                throw new Error('유효하지 않은 좌표 형식입니다.');
            }
            
            const [lng, lat, ele] = coord;
            
            if (isNaN(lat) || isNaN(lng)) {
                throw new Error('유효하지 않은 좌표 값입니다.');
            }

            return {
                lat: parseFloat(lat),
                lng: parseFloat(lng),
                ele: ele ? parseFloat(ele) : null,
            };
        });

        return trackPoints;
    } catch (error) {
        console.error("GeoJSON 파싱 에러:", error);
        throw error;
    }
};

/**
 * API에서 받은 GeoJSON 문자열 또는 객체를 처리
 * @param {string|Object} geoJsonData - GeoJSON 문자열 또는 객체
 * @returns {Array} 트랙 포인트 배열
 */
export const loadGeoJSONData = (geoJsonData) => {
    try {
        let geoJson;
        
        if (typeof geoJsonData === 'string') {
            geoJson = JSON.parse(geoJsonData);
        } else if (typeof geoJsonData === 'object') {
            geoJson = geoJsonData;
        } else {
            throw new Error('GeoJSON 데이터가 문자열이나 객체가 아닙니다.');
        }

        return parseGeoJSON(geoJson);
    } catch (error) {
        console.error('GeoJSON 로드 에러:', error);
        throw error;
    }
};

/**
 * 트랙 포인트 배열에서 경계 좌표 계산
 * @param {Array} trackPoints - 트랙 포인트 배열
 * @returns {Object} 경계 좌표 {minLat, maxLat, minLng, maxLng}
 */
export const calculateBounds = (trackPoints) => {
    if (!trackPoints || trackPoints.length === 0) {
        return null;
    }

    const lats = trackPoints.map((point) => point.lat);
    const lngs = trackPoints.map((point) => point.lng);

    return {
        minLat: Math.min(...lats),
        maxLat: Math.max(...lats),
        minLng: Math.min(...lngs),
        maxLng: Math.max(...lngs),
    };
};

/**
 * 트랙 포인트 배열에서 평균 중심점 계산
 * @param {Array} trackPoints - 트랙 포인트 배열
 * @returns {Object|null} 중심점 좌표 {lat, lng} 또는 null
 */
export const calculateCenter = (trackPoints) => {
    if (!trackPoints || trackPoints.length === 0) {
        return null;
    }

    const totalLat = trackPoints.reduce((sum, point) => sum + point.lat, 0);
    const totalLng = trackPoints.reduce((sum, point) => sum + point.lng, 0);

    return {
        lat: totalLat / trackPoints.length,
        lng: totalLng / trackPoints.length,
    };
};

/**
 * 트랙 포인트 배열을 GeoJSON LineString 객체로 변환
 * @param {Array} trackPoints - [{lat, lng}]
 * @returns {Object} GeoJSON LineString
 */
export function trackPointsToGeoJSONLineString(trackPoints) {
    return {
        type: "LineString",
        coordinates: trackPoints.map(pt => [pt.lng, pt.lat])
    };
}

/**
 * 트랙 포인트 배열을 WKT(LineString) 문자열로 변환
 * @param {Array} trackPoints - [{lat, lng}]
 * @returns {string} WKT LineString
 */
export function trackPointsToWKTLineString(trackPoints) {
    const coords = trackPoints.map(pt => `${pt.lng} ${pt.lat}`).join(", ");
    return `LINESTRING(${coords})`;
}

export { loadGeoJSONData as loadGeoJSONFromData, parseGeoJSON };