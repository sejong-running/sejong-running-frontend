/**
 * description에 저장된 경로 데이터를 geom 컬럼에 업데이트하는 유틸리티
 * Supabase SQL Editor에서 실행할 SQL 생성
 */

import { supabase } from './supabaseClient.js';

export async function generateGeomUpdateSQL() {
  try {
    // description에 ROUTE_DATA가 있는 모든 코스 조회
    const { data: courses, error } = await supabase
      .from('courses')
      .select('id, title, description')
      .like('description', '%[ROUTE_DATA:%');

    if (error) {
      throw error;
    }

    const sqlStatements = [];

    for (const course of courses) {
      try {
        // description에서 ROUTE_DATA 추출
        const routeDataMatch = course.description.match(/\[ROUTE_DATA:(.*?)\]/);
        if (routeDataMatch) {
          const routeInfo = JSON.parse(routeDataMatch[1]);
          const geoJson = routeInfo.geoJSON;
          
          // SQL 문 생성
          const sql = `UPDATE courses SET geom = ST_GeomFromGeoJSON('${JSON.stringify(geoJson)}') WHERE id = ${course.id};`;
          sqlStatements.push({
            courseId: course.id,
            title: course.title,
            sql: sql
          });
        }
      } catch (parseError) {
        console.warn(`코스 ${course.id} 경로 데이터 파싱 실패:`, parseError);
      }
    }

    return sqlStatements;
  } catch (error) {
    console.error('geom 업데이트 SQL 생성 실패:', error);
    return [];
  }
}

// 사용 예시:
// generateGeomUpdateSQL().then(statements => {
//   console.log('Supabase SQL Editor에서 실행할 SQL:');
//   statements.forEach(stmt => {
//     console.log(`-- ${stmt.title} (ID: ${stmt.courseId})`);
//     console.log(stmt.sql);
//     console.log('');
//   });
// });