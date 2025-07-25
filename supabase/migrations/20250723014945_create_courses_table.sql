 create table if not exists courses (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  description text,
  distance float,
  duration text,
  difficulty text,
  rating float,
  gpx_file_url text,
  image_url text,
  created_at timestamp with time zone default now()
);