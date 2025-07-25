import 'dotenv/config';
import { supabase } from "./supabaseClient.js";
import { loadGPXFromUrl, trackPointsToGeoJSONLineString, parseGPX, trackPointsToWKTLineString } from "./gpxParser.js";
import fetch from "node-fetch";

async function insertOneCourseFromJsonWithGpx() {
  // 1. JSON 파일 fetch
  const res = await fetch(
    "https://dqvinrpjxbnvforphomu.supabase.co/storage/v1/object/sign/course-gpx/course_info.json?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZjRlN2QyMy05YzZiLTRhNDgtOTU2ZS02OWQwZDM1YzU3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Vyc2UtZ3B4L2NvdXJzZV9pbmZvLmpzb24iLCJpYXQiOjE3NTMzNDQwMDIsImV4cCI6MTc4NDg4MDAwMn0.fslCdJO0VjOro0XF8bjle_ySDBhnGXydkhfP94oyg5U"
  );
  const courseList = await res.json();
  const course = courseList[9]; // id=9 코스만 선택 (금강보행교한바퀴_1.5km)
  const gpxFilePath = `course-gpx/gpxdata/${course.filename}`;

  // 2. GPX 파일 signed URL 동적 발급
  const { data: urlData } = await supabase
    .storage
    .from('course-gpx')
    .createSignedUrl(`gpxdata/${course.filename}`, 60 * 60); // 1시간
  const gpxUrl = urlData.signedUrl;

  // 3. GPX 파일에서 트랙 포인트 추출
  let start_latitude = null, start_longitude = null, end_latitude = null, end_longitude = null;
  try {
    const gpxRes = await fetch(gpxUrl);
    console.log('GPX fetch status:', gpxRes.status);
    const gpxContent = await gpxRes.text();
    console.log('GPX content:', gpxContent.slice(0, 500)); // 앞부분만 출력
    const trackPoints = parseGPX(gpxContent);
    console.log('trackPoints:', trackPoints);
    if (trackPoints.length > 0) {
      start_latitude = trackPoints[0].lat;
      start_longitude = trackPoints[0].lng;
      end_latitude = trackPoints[trackPoints.length - 1].lat;
      end_longitude = trackPoints[trackPoints.length - 1].lng;
      // WKT(LineString) 변환 or GeoJSON 변환
      var geom = trackPointsToWKTLineString(trackPoints);
      var geomGeoJSON = trackPointsToGeoJSONLineString(trackPoints);
    }
  } catch (e) {
    console.error("GPX 파싱 실패, start/end 좌표는 null로 입력:", e);
    var geom = null;
    var geomGeoJSON = null;
  }

  // 4. 더미 데이터 생성
  const dummyCourse = {
    title: course.course_name,
    distance: course.distance,
    gpx_file_path: gpxFilePath, // 상대경로로 저장
    description: "이 코스는 세종시의 아름다운 경로를 따라 달릴 수 있는 추천 코스입니다.",
    start_latitude,
    start_longitude,
    end_latitude,
    end_longitude,
    created_by: 1, // 더미 유저 id
    likes_count: 1500,
    created_time: new Date().toISOString(),
  };

  // Supabase에 raw SQL로 삽입 (ST_GeomFromGeoJSON 사용)
  if (geomGeoJSON) {
    const updateSql = `
      UPDATE courses
      SET geom = ST_GeomFromGeoJSON('${JSON.stringify(geomGeoJSON)}')
      WHERE gpx_file_path = 'gpxdata/course_8.gpx';
    `;
    const { error } = await supabase.rpc('execute_sql', { sql: updateSql });
    if (error) {
      console.error("코스 9번 geom UPDATE 실패:", error.message);
    } else {
      console.log("코스 9번 geom UPDATE 성공!");
    }
    return;
  }
}

// 실행
insertOneCourseFromJsonWithGpx(); 