 create table if not exists favorites (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references users(id) on delete cascade,
  course_id uuid references courses(id) on delete cascade,
  favorited_at timestamp with time zone default now(),
  unique(user_id, course_id)
);