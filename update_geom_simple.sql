-- 지도에서 생성된 경로를 PostGIS geometry로 저장하는 RPC 함수
-- 사용법: Supabase SQL Editor에서 이 SQL을 실행하세요
-- 
-- 이 함수가 생성되면 어드민 페이지에서 지도 경로 생성 시
-- 자동으로 geom 데이터가 PostGIS geometry 형태로 저장됩니다.

CREATE OR REPLACE FUNCTION update_geom_from_wkt(
  course_id integer,
  wkt_string text
)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE courses 
  SET geom = ST_GeomFromText(wkt_string, 4326) 
  WHERE id = course_id;
  
  -- 업데이트된 행이 있으면 true 반환
  RETURN FOUND;
END;
$$;