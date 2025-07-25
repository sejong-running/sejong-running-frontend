 create table if not exists types (
  id serial primary key,
  name varchar(30) unique not null,
  category varchar(20) not null
);