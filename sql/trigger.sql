-- === 트리거 및 함수 통합 관리 파일 ===
-- 이 파일에는 프로젝트 내 모든 테이블의 트리거 및 관련 함수를 통합 관리합니다.

-- [user_stats 자동 집계 트리거 및 함수]
-- run_records에 INSERT, UPDATE, DELETE 발생 시
-- 해당 user_id의 user_stats를 자동으로 집계/갱신

CREATE OR REPLACE FUNCTION update_user_stats_for_run_records()
RETURNS TRIGGER AS $$
DECLARE
  uid integer;
  _total_runs integer;
  _total_distance decimal(8,2);
  _best_pace decimal(6,2);
BEGIN
  IF (TG_OP = 'DELETE') THEN
    uid := OLD.user_id;
  ELSE
    uid := NEW.user_id;
  END IF;

  SELECT
    COUNT(*)::integer,
    COALESCE(SUM(actual_distance_km),0)::decimal(8,2),
    MIN(actual_pace)
  INTO
    _total_runs, _total_distance, _best_pace
  FROM run_records
  WHERE user_id = uid;

  IF EXISTS (SELECT 1 FROM user_stats WHERE user_id = uid) THEN
    UPDATE user_stats
    SET
      total_runs = _total_runs,
      total_distance_km = _total_distance,
      best_pace = _best_pace
    WHERE user_id = uid;
  ELSE
    INSERT INTO user_stats (user_id, total_runs, total_distance_km, best_pace)
    VALUES (uid, _total_runs, _total_distance, _best_pace);
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS run_records_stats_trigger ON run_records;
CREATE TRIGGER run_records_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON run_records
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_for_run_records();

-- [여기에 다른 테이블의 트리거/함수도 추가 관리하세요] 