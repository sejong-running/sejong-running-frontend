import 'dotenv/config';
import { supabase } from "./supabaseClient.js";
import { loadGPXFromUrl } from "./gpxParser.js";

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
    let start_latitude = null, start_longitude = null, end_latitude = null, end_longitude = null;
    try {
      const { data: urlData } = await supabase
        .storage
        .from('course-gpx')
        .createSignedUrl(gpxPath, 60 * 60); // 1시간
      if (urlData && urlData.signedUrl) {
        const trackPoints = await loadGPXFromUrl(urlData.signedUrl);
        if (trackPoints.length > 0) {
          start_latitude = trackPoints[0].lat;
          start_longitude = trackPoints[0].lng;
          end_latitude = trackPoints[trackPoints.length - 1].lat;
          end_longitude = trackPoints[trackPoints.length - 1].lng;
        }
      }
    } catch (e) {
      console.error(`GPX 파싱 실패: ${course.filename}`, e);
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
      start_latitude,
      start_longitude,
      end_latitude,
      end_longitude,
      created_by,
      likes_count,
      created_time: new Date().toISOString(),
    };
    const { error } = await supabase.from("courses").upsert(dummyCourse, { onConflict: "gpx_file_path" });
    if (error) {
      console.error(`코스 upsert 실패: ${course.course_name}`, error.message);
    } else {
      console.log(`코스 upsert 성공: ${course.course_name}`);
    }
  }
}

// 실행
insertAllCoursesFromJson(); 