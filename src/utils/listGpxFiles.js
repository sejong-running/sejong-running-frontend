// 스토리지 접근해서 List볼수있는지 확인하는 코드

import { supabase } from "./supabaseClient.js";

async function listGpxFiles() {
  const { data, error } = await supabase.storage.from('course-gpx').list('gpxdata', {
    limit: 100,
    offset: 0,
    sortBy: { column: 'name', order: 'asc' },
  });
  if (error) {
    console.error('Storage 파일 목록 조회 실패:', error.message);
    return;
  }
  console.log('gpxdata 폴더 내 파일 목록:');
  data.forEach(file => console.log(file.name));
}

listGpxFiles(); 