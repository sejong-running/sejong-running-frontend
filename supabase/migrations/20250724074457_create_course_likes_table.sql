 create table if not exists course_likes (
  user_id integer not null references users(id) on delete cascade,
  course_id integer not null references courses(id) on delete cascade,
  created_time timestamp default now(),
  primary key (user_id, course_id)
);