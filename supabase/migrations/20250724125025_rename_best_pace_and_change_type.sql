 ALTER TABLE user_stats RENAME COLUMN best_pace_sec_km TO best_pace;
ALTER TABLE user_stats ALTER COLUMN best_pace TYPE decimal(6,2) USING best_pace::decimal(6,2);
COMMENT ON COLUMN user_stats.best_pace IS '최고 페이스 기록 (해당 유저의 run_records.actual_pace 중 최소값, 단위: 초/km, 예: 300.00 = 5분/km)';