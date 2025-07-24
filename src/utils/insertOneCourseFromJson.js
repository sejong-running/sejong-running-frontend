import 'dotenv/config';
import { supabase } from "./supabaseClient.js";
import { loadGPXFromUrl } from "./gpxParser.js";

async function insertOneCourseFromJsonWithGpx() {
  // 1. JSON 파일 fetch
  const res = await fetch(
    "https://dqvinrpjxbnvforphomu.supabase.co/storage/v1/object/sign/course-gpx/course_info.json?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZjRlN2QyMy05YzZiLTRhNDgtOTU2ZS02OWQwZDM1YzU3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Vyc2UtZ3B4L2NvdXJzZV9pbmZvLmpzb24iLCJpYXQiOjE3NTMzNDQwMDIsImV4cCI6MTc4NDg4MDAwMn0.fslCdJO0VjOro0XF8bjle_ySDBhnGXydkhfP94oyg5U"
  );
  const courseList = await res.json();
  const course = courseList.find(c => c.id === 11); // id=11 코스만 선택
  const gpxFilePath = `course-gpx/gpxdata/${course.filename}`;

  // 2. GPX 파일 signed URL 사용
  const gpxUrl = "https://dqvinrpjxbnvforphomu.supabase.co/storage/v1/object/sign/course-gpx/gpxdata/course_0.gpx?token=eyJraWQiOiJzdG9yYWdlLXVybC1zaWduaW5nLWtleV81ZjRlN2QyMy05YzZiLTRhNDgtOTU2ZS02OWQwZDM1YzU3MjkiLCJhbGciOiJIUzI1NiJ9.eyJ1cmwiOiJjb3Vyc2UtZ3B4L2dweGRhdGEvY291cnNlXzAuZ3B4IiwiaWF0IjoxNzUzMzQ0NzgyLCJleHAiOjE3ODQ4ODA3ODJ9.ru9iEXiH4qr52ON4-HvEWqXCXiXRA5JlfVO1tWHE-Ew";

  // 3. GPX 파일에서 트랙 포인트 추출
  let start_latitude = null, start_longitude = null, end_latitude = null, end_longitude = null;
  try {
    const trackPoints = await loadGPXFromUrl(gpxUrl);
    if (trackPoints.length > 0) {
      start_latitude = trackPoints[0].lat;
      start_longitude = trackPoints[0].lng;
      end_latitude = trackPoints[trackPoints.length - 1].lat;
      end_longitude = trackPoints[trackPoints.length - 1].lng;
    }
  } catch (e) {
    console.error("GPX 파싱 실패, start/end 좌표는 null로 입력:", e);
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

  // 5. courses 테이블에 insert
  const { error } = await supabase.from("courses").insert(dummyCourse);
  if (error) {
    console.error("코스 insert 실패:", error.message);
  } else {
    console.log("코스 insert 성공:", dummyCourse);
  }
}

// 실행
insertOneCourseFromJsonWithGpx(); 