 ALTER TABLE run_records DROP COLUMN actual_pace;
ALTER TABLE run_records ADD COLUMN actual_pace decimal(6,2) GENERATED ALWAYS AS (actual_duration_sec / actual_distance_km) STORED;
COMMENT ON COLUMN run_records.actual_pace IS '1km당 소요 시간 (초 단위, 예: 315.00 = 5분 15초/km, 자동계산: actual_duration_sec / actual_distance_km)';