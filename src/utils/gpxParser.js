/**
 * GPX 파일을 파싱하여 트랙 포인트 데이터를 추출하는 유틸리티
 */

import { DOMParser } from 'xmldom';

/**
 * GPX XML 문자열을 파싱하여 트랙 포인트 배열을 반환
 * @param {string} gpxContent - GPX XML 문자열
 * @returns {Array} 트랙 포인트 배열 [{lat, lng, ele}, ...]
 */
const parseGPX = (gpxContent) => {
    try {
        const parser = new DOMParser();
        const xmlDoc = parser.parseFromString(gpxContent, "text/xml");

        // XML 파싱 에러 체크
        const parseError = xmlDoc.getElementsByTagName("parsererror");
        if (parseError.length > 0) {
            throw new Error("GPX 파일 파싱에 실패했습니다.");
        }

        const trackPoints = [];
        const trkptElements = xmlDoc.getElementsByTagName("trkpt");

        for (let i = 0; i < trkptElements.length; i++) {
            const trkpt = trkptElements[i];
            const lat = parseFloat(trkpt.getAttribute("lat"));
            const lon = parseFloat(trkpt.getAttribute("lon"));

            // 고도 정보 추출 (선택사항)
            const eleElement = trkpt.getElementsByTagName("ele")[0];
            const ele = eleElement ? parseFloat(eleElement.textContent) : null;

            if (!isNaN(lat) && !isNaN(lon)) {
                trackPoints.push({
                    lat,
                    lng: lon,
                    ele,
                });
            }
        }

        return trackPoints;
    } catch (error) {
        console.error("GPX 파싱 에러:", error);
        throw error;
    }
};

let lastWorker = null;
let lastRequestId = 0;
/**
 * GPX 파일을 fetch하여 파싱
 * @param {string} gpxUrl - GPX 파일 URL
 * @returns {Promise<Array>} 트랙 포인트 배열
 */
export const loadGPXFromUrlWithWorker = async (gpxUrl) => {
    return new Promise(async (resolve, reject) => {
        try {
            if (lastWorker) {
                lastWorker.terminate();
            }
            const response = await fetch(gpxUrl);
            if (!response.ok) {
                throw new Error(`GPX 파일 로드 실패: ${response.status}`);
            }
            const gpxContent = await response.text();
            const worker = new Worker(new URL('./gpxWorker.js', import.meta.url));
            lastWorker = worker;
            const requestId = ++lastRequestId;
            worker.postMessage({ gpxContent, requestId });
            worker.onmessage = (e) => {
                if (e.data.requestId !== lastRequestId) {
                    worker.terminate();
                    return; // 최신 요청이 아니면 무시
                }
                const { trackPoints, error } = e.data;
                if (error) {
                    reject(new Error(error));
                } else {
                    resolve(trackPoints);
                }
                worker.terminate();
            };
            worker.onerror = (err) => {
                reject(err);
                worker.terminate();
            };
        } catch (error) {
            reject(error);
        }
    });
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

export { loadGPXFromUrlWithWorker as loadGPXFromUrl, parseGPX };
