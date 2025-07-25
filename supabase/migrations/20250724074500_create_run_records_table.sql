 create table if not exists run_records (
  id serial primary key,
  user_id integer not null references users(id) on delete cascade,
  course_id integer not null references courses(id) on delete restrict,
  actual_distance_km decimal(5,2),
  actual_duration_sec integer,
  created_time timestamp default now()
);