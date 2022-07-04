CREATE TABLE movie_users
(
    user_id         serial       not null primary key,
    user_name       text         NOT NULL,
    password        text                ,
    first_name      text                ,
    surname         text                

);

CREATE TABLE movie_playlist
(
    playlist_id  serial       not null primary key,
    movie_id     text         NOT NULL,
    movie_name   text         NOT NULL,
    movie_poster text         NOT NULL,
    user_id      INT          NOT NULL,  
    foreign key (user_id) references movie_users(user_id)
    ON DELETE CASCADE
    ON UPDATE CASCADE
);