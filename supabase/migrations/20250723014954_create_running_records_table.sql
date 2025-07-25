 create table if not exists running_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  completed_at timestamp with time zone default now(),
  actual_distance float,
  actual_duration text,
  personal_best boolean default false,
  notes text
);