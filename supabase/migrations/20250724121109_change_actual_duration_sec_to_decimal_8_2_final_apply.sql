 ALTER TABLE run_records
ALTER COLUMN actual_duration_sec TYPE decimal(8,2) USING actual_duration_sec::decimal(8,2);