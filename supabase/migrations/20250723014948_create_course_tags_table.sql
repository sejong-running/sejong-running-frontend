 create table if not exists course_tags (
  id serial primary key,
  course_id uuid references courses(id) on delete cascade,
  tag text
);