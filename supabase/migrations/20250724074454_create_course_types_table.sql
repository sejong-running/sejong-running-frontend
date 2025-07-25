 create table if not exists course_types (
  course_id integer not null references courses(id) on delete cascade,
  type_id integer not null references types(id) on delete cascade,
  primary key (course_id, type_id)
);