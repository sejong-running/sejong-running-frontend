import 'dotenv/config';
import { supabase } from "./supabaseClient.js";
import { loadGPXFromUrl, trackPointsToGeoJSONLineString, parseGPX } from "./gpxParser.js";
import fetch from "node-fetch";

// 임의 유저 id 목록 (admin, 손흥민, 이강인, 황희찬)
const userIds = [1, 2, 3, 4];

async function insertAllCoursesFromJson() {
  // 1. JSON 파일 fetch
  const res = await fetch(
    "https://dqvinrpjxbnvforphomu.supabase.co/storage/v1/object/sign/course-gpx/course_info.json?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZjRlN2QyMy05YzZiLTRhNDgtOTU2ZS02OWQwZDM1YzU3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Vyc2UtZ3B4L2NvdXJzZV9pbmZvLmpzb24iLCJpYXQiOjE3NTMzNDQwMDIsImV4cCI6MTc4NDg4MDAwMn0.fslCdJO0VjOro0XF8bjle_ySDBhnGXydkhfP94oyg5U"
  );
  const courseList = await res.json();

  for (const course of courseList) {
    // 2. GPX 파일 상대 경로 생성
    const gpxPath = `gpxdata/${course.filename}`;
    // 2-1. signed URL은 필요할 때만 발급

    // 3. GPX 파일에서 트랙 포인트 추출 (signed URL로 발급해서 사용)
    let min_latitude = null, min_longitude = null, max_latitude = null, max_longitude = null;
    try {
      const { data: urlData } = await supabase
        .storage
        .from('course-gpx')
        .createSignedUrl(gpxPath, 60 * 60); // 1시간
      if (urlData && urlData.signedUrl) {
        // Node 환경에서는 fetch+parseGPX 사용
        const gpxRes = await fetch(urlData.signedUrl);
        const gpxContent = await gpxRes.text();
        const trackPoints = parseGPX(gpxContent);
        if (trackPoints.length > 0) {
          min_latitude = Math.min(...trackPoints.map(pt => pt.lat));
          min_longitude = Math.min(...trackPoints.map(pt => pt.lng));
          max_latitude = Math.max(...trackPoints.map(pt => pt.lat));
          max_longitude = Math.max(...trackPoints.map(pt => pt.lng));
          // GeoJSON(LineString) 변환
          var geomGeoJSON = trackPointsToGeoJSONLineString(trackPoints);
        }
      }
    } catch (e) {
      console.error(`GPX 파싱 실패: ${course.filename}`, e);
      var geomGeoJSON = null;
    }

    // 4. 임의 데이터 생성
    const created_by = userIds[Math.floor(Math.random() * userIds.length)];
    const likes_count = Math.floor(Math.random() * 2000) + 100; // 100~2099
    const description = `이 코스는 ${course.course_name} 구간을 달릴 수 있는 추천 코스입니다.`;

    // 5. courses 테이블에 upsert (gpx_file_path 기준 중복 방지)
    const dummyCourse = {
      title: course.course_name,
      distance: course.distance,
      gpx_file_path: gpxPath,
      description,
      min_latitude,
      min_longitude,
      max_latitude,
      max_longitude,
      created_by,
      likes_count,
      created_time: new Date().toISOString(),
    };
    // Supabase에 raw SQL로 upsert (ST_GeomFromGeoJSON 사용)
    if (geomGeoJSON) {
      const insertSql = `
        INSERT INTO courses (
          title, distance, gpx_file_path, description, min_latitude, min_longitude, max_latitude, max_longitude, created_by, likes_count, created_time, geom
        ) VALUES (
          '${dummyCourse.title.replace(/'/g, "''")}',
          ${dummyCourse.distance},
          '${dummyCourse.gpx_file_path.replace(/'/g, "''")}',
          '${dummyCourse.description.replace(/'/g, "''")}',
          ${dummyCourse.min_latitude},
          ${dummyCourse.min_longitude},
          ${dummyCourse.max_latitude},
          ${dummyCourse.max_longitude},
          ${dummyCourse.created_by},
          ${dummyCourse.likes_count},
          '${dummyCourse.created_time}',
          ST_GeomFromGeoJSON('${JSON.stringify(geomGeoJSON)}')
        )
        ON CONFLICT (gpx_file_path) DO UPDATE SET
          title = EXCLUDED.title,
          distance = EXCLUDED.distance,
          description = EXCLUDED.description,
          min_latitude = EXCLUDED.min_latitude,
          min_longitude = EXCLUDED.min_longitude,
          max_latitude = EXCLUDED.max_latitude,
          max_longitude = EXCLUDED.max_longitude,
          created_by = EXCLUDED.created_by,
          likes_count = EXCLUDED.likes_count,
          created_time = EXCLUDED.created_time,
          geom = EXCLUDED.geom;
      `;
      const { error } = await supabase.rpc('execute_sql', { sql: insertSql });
      if (error) {
        console.error(`코스 upsert 실패: ${course.course_name}`, error.message);
      } else {
        console.log(`코스 upsert 성공: ${course.course_name}`);
      }
    } else {
      const { error } = await supabase.from("courses").upsert(dummyCourse, { onConflict: "gpx_file_path" });
      if (error) {
        console.error(`코스 upsert 실패: ${course.course_name}`, error.message);
      } else {
        console.log(`코스 upsert 성공: ${course.course_name}`);
      }
    }
  }
}

// 실행
insertAllCoursesFromJson(); 