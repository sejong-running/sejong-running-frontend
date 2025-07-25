 CREATE OR REPLACE FUNCTION update_user_stats_for_run_records()
RETURNS TRIGGER AS $$
DECLARE
  uid integer;
  total_runs integer;
  total_distance decimal(8,2);
  best_pace decimal(6,2);
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
    total_runs, total_distance, best_pace
  FROM run_records
  WHERE user_id = uid;

  IF EXISTS (SELECT 1 FROM user_stats WHERE user_id = uid) THEN
    UPDATE user_stats
    SET
      total_runs = total_runs,
      total_distance_km = total_distance,
      best_pace = best_pace,
      updated_at = NOW()
    WHERE user_id = uid;
  ELSE
    INSERT INTO user_stats (user_id, total_runs, total_distance_km, best_pace, updated_at)
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