 create table if not exists course_images (
  id serial primary key,
  course_id integer not null references courses(id) on delete cascade,
  image_url varchar(500) not null
);