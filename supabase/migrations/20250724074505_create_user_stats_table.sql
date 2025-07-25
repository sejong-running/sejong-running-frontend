 create table if not exists user_stats (
  user_id integer primary key references users(id) on delete cascade,
  total_distance_km decimal(8,2) default 0,
  total_runs integer default 0,
  best_pace_sec_km integer,
  updated_at timestamp default now()
);