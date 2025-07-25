 COMMENT ON COLUMN user_stats.total_distance_km IS '총 누적 거리 (km, 해당 유저의 run_records.actual_distance_km 합계, 예: 1234.56km)';
COMMENT ON COLUMN user_stats.total_runs IS '총 러닝 횟수 (해당 유저의 run_records 개수, 예: 150회)';
COMMENT ON COLUMN user_stats.best_pace_sec_km IS '최고 페이스 기록 (해당 유저의 run_records.actual_pace 중 최소값을 초/km로 변환, 예: 300 = 5분/km)';