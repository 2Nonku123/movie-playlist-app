create database movie_app_database;
create role movie_user login password 'movie_user123';
grant all privileges on database movie_app_database to movie_user;