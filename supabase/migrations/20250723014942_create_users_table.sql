create table if not exists users (
  id uuid primary key default gen_random_uuid(),
  email text unique,
  nickname text,
  created_at timestamp with time zone default now()
); 