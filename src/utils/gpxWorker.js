/* eslint-disable no-restricted-globals */
import { XMLParser } from 'fast-xml-parser';

self.onmessage = function(e) {
    const { gpxContent, requestId } = typeof e.data === 'object' && e.data.gpxContent !== undefined ? e.data : { gpxContent: e.data, requestId: 0 };
    try {
        const parser = new XMLParser({
            ignoreAttributes: false,
            attributeNamePrefix: '',
            ignoreNameSpace: true,
        });
        const xmlObj = parser.parse(gpxContent);
        let trackPoints = [];
        let debug = {};
        if (xmlObj.gpx) debug.gpxKeys = Object.keys(xmlObj.gpx);
        let trks = xmlObj.gpx && xmlObj.gpx.trk ? xmlObj.gpx.trk : null;
        if (trks) {
            if (!Array.isArray(trks)) trks = [trks];
            for (const trk of trks) {
                let trksegs = trk.trkseg ? trk.trkseg : null;
                if (trksegs) {
                    if (!Array.isArray(trksegs)) trksegs = [trksegs];
                    for (const trkseg of trksegs) {
                        let trkpts = trkseg.trkpt ? trkseg.trkpt : null;
                        if (trkpts) {
                            if (!Array.isArray(trkpts)) trkpts = [trkpts];
                            for (const pt of trkpts) {
                                trackPoints.push({
                                    lat: parseFloat(pt.lat || pt['lat'] || pt['@_lat']),
                                    lng: parseFloat(pt.lon || pt['lon'] || pt['@_lon']),
                                    ele: pt.ele ? parseFloat(pt.ele) : null,
                                });
                            }
                        }
                    }
                }
            }
        }
        trackPoints = trackPoints.filter(pt => !isNaN(pt.lat) && !isNaN(pt.lng));
        debug.trackPointsCount = trackPoints.length;
        if (!trackPoints.length) {
            throw new Error('GPX 파일에 <trkpt>가 없습니다. 구조: ' + JSON.stringify(debug) + ' (상위 gpx 키: ' + (debug.gpxKeys || []).join(',') + ')');
        }
        self.postMessage({ trackPoints, error: null, debug, requestId });
    } catch (error) {
        self.postMessage({ trackPoints: [], error: error.message, requestId });
    }
}; 