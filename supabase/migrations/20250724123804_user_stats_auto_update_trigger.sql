 CREATE OR REPLACE FUNCTION update_user_stats_for_run_records()
RETURNS TRIGGER AS $$
DECLARE
  uid integer;
  total_runs integer;
  total_distance decimal(8,2);
  best_pace decimal(5,2);
BEGIN
  -- INSERT/UPDATE/DELETE 모두 대응: NEW와 OLD에서 user_id 추출
  IF (TG_OP = 'DELETE') THEN
    uid := OLD.user_id;
  ELSE
    uid := NEW.user_id;
  END IF;

  -- 집계 쿼리
  SELECT
    COUNT(*)::integer,
    COALESCE(SUM(actual_distance_km),0)::decimal(8,2),
    MIN(actual_pace)
  INTO
    total_runs, total_distance, best_pace
  FROM run_records
  WHERE user_id = uid;

  -- best_pace_sec_km는 분/km → 초/km로 변환(최소값 * 60, null이면 null)
  IF best_pace IS NOT NULL THEN
    best_pace := ROUND(best_pace * 60, 0);
  END IF;

  -- user_stats에 이미 row가 있으면 UPDATE, 없으면 INSERT
  IF EXISTS (SELECT 1 FROM user_stats WHERE user_id = uid) THEN
    UPDATE user_stats
    SET
      total_runs = total_runs,
      total_distance_km = total_distance,
      best_pace_sec_km = best_pace,
      updated_at = NOW()
    WHERE user_id = uid;
  ELSE
    INSERT INTO user_stats (user_id, total_runs, total_distance_km, best_pace_sec_km, updated_at)
    VALUES (uid, total_runs, total_distance, best_pace, NOW());
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS run_records_stats_trigger ON run_records;
CREATE TRIGGER run_records_stats_trigger
AFTER INSERT OR UPDATE OR DELETE ON run_records
FOR EACH ROW
EXECUTE FUNCTION update_user_stats_for_run_records();