 create table if not exists courses (
  id serial primary key,
  title varchar(100) not null,
  description text,
  distance decimal(5,2) not null,
  gpx_file_url varchar(500) not null,
  start_latitude decimal(10,8) not null,
  start_longitude decimal(11,8) not null,
  end_latitude decimal(10,8),
  end_longitude decimal(11,8),
  created_by integer not null references users(id) on delete cascade,
  created_time timestamp default now(),
  likes_count integer not null default 0
);