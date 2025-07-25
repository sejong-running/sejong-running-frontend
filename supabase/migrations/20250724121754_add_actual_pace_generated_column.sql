 ALTER TABLE run_records
ADD COLUMN actual_pace decimal(5,2) GENERATED ALWAYS AS (CASE WHEN actual_distance_km > 0 THEN actual_duration_sec / actual_distance_km / 60 ELSE NULL END) STORED;