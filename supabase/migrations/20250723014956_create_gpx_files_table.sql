 create table if not exists gpx_files (
  id uuid primary key default gen_random_uuid(),
  course_id uuid references courses(id) on delete cascade,
  file_url text not null,
  uploaded_at timestamp with time zone default now()
);