require("dotenv").config();
const express = require("express");
const app = express();
const jwt = require("jsonwebtoken");
const bcrypt = require("bcrypt");
const cors = require("cors");
const pg = require("pg");
const axios = require("axios");

const UserDB = require("./database/userdb");
const PlaylistDB = require("./database/playlistdb");
const Pool = pg.Pool;

/// Secret Constants
const jwt_key = process.env.ACCESS_TOKEN_SECRET || "";
const connection_string = process.env.DATABASE_URL || "";
const themoviedbapi_key = process.env.MOVIE_API_KEY || "";

// app use code
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

const pool = new Pool({
  connectionString: connection_string,
});
//////////////////////////////

const userDB = UserDB(pool);
const playlistDB = PlaylistDB(pool);
const PORT = process.env.PORT || 4017;

app.post("/api/login", async function (req, res) {
  const { user_name, password } = req.body;

  userDB
    .getUser(user_name)
    .then((user_account) => {
      if (bcrypt.compareSync(password, user_account.password)) {
        const user = {
          user_id: user_account.user_id,
          first_name: user_account.first_name,
          surname: user_account.surname,
        };
        const accessKey = jwt.sign(user, jwt_key, {
          expiresIn: "5h",
        });

        res.json({
          status: "success",
          message: "Login was successful",
          token: accessKey,
        });
      } else {
        res.json({
          status: "error",
          message: "User could not be found, wrong user name or password",
          token: "",
        });
      }
    })
    .catch((error) => {
      res.json({
        status: "error",
        message: "User could not be found, wrong user name or password",
        token: "",
      });
    });
});

app.post("/api/signup", async function (req, res) {
  const { user_name, password, first_name, surname } = req.body;

  if (!password || !user_name || !first_name || !surname) {
    res.json({
      status: "error",
      message: "Please enter information for all inputs",
    });
  } else {
    let user_account = await userDB.getUser(user_name);

    if (user_account != null && user_account.id != null) {
      res.json({
        status: "error",
        message: "Account aleady exists",
      });
      return;
    }

    const encrypted_password = bcrypt.hashSync(password, 10);
    const result = await userDB.registerUser(
      user_name,
      encrypted_password,
      first_name,
      surname
    );

    if (result > 0) {
      user_account = await userDB.getUser(user_name);
      const user = {
        user_id: user_account.user_id,
        first_name: first_name,
        surname: surname,
      };
      const accessKey = jwt.sign(user, jwt_key, {
        expiresIn: "5h",
      });
      res.json({
        status: "success",
        message: "Signup success",
        token: accessKey,
      });
    } else {
      res.json({
        status: "error",
        message: "Could not sign up user",
      });
    }
  }
});

app.get(
  "/search/:movie_name",
  checkAuthorizationToken,
  async function (req, res) {
    const movie_name = req.params.movie_name;

    if (movie_name) {
      axios
        .get(
          `https://api.themoviedb.org/3/search/movie?api_key=${themoviedbapi_key}&query=${movie_name}`,
          null
        )
        .then((result) => result.data)
        .then((result) => res.json(result))
        .catch((error) =>
          res.json({ page: 0, total_pages: 0, total_results: 0, results: [] })
        );
    } else {
      res.json({ page: 0, total_pages: 0, total_results: 0, results: [] });
    }
  }
);

app.get("/playlist", checkAuthorizationToken, async function (req, res) {
  playlistDB
    .listPlaylistMovies(req.user.user_id)
    .then((playlist) => res.json(playlist))
    .catch((error) => res.json([]));
});

app.post("/playlist", checkAuthorizationToken, async function (req, res) {
  const { movie_id } = req.body;

  if (movie_id) {
    playlistDB
      .checkMovie(movie_id, req.user.user_id)
      .then((movie_result) => {
        if (movie_result.movies == 0) {
          axios
            .get(
              `https://api.themoviedb.org/3/movie/${movie_id}?api_key=${themoviedbapi_key}&append_to_response=videos`
            )
            .then((result) => result.data)
            .then((result) =>
              playlistDB.addPlaylistMovie(
                result.id,
                result.original_title,
                result.poster_path,
                req.user.user_id
              )
            )
            .then((result) => {
              if (result > 0) {
                res.json({
                  status: "success",
                  message: "Movie added to playlist",
                });
              } else {
                res.json({
                  status: "error",
                  message: "Could not add selected movie",
                });
              }
            })
            .catch((err) => {
              res.json({
                status: "error",
                message: "Could not find movie 2",
              });
            });
        } else {
          res.json({
            status: "error",
            message: "Movie already exists ",
          });
        }
      })
      .catch((error) =>
        res.json({
          status: "error",
          message: "Movie not found 3",
        })
      );
  } else {
    res.json({
      status: "error",
      message: "Movie not found 4",
    });
  }
});

app.delete(
  "/playlist/:movie_id",
  checkAuthorizationToken,
  async function (req, res) {
    const movie_id = req.params.movie_id;

    if (movie_id) {
      playlistDB
        .deletePlaylistMovie(movie_id, req.user.user_id)
        .then((result) => {
          if (result > 0) {
            res.json({
              status: "success",
              message: "Playlist movie deleted",
            });
          } else {
            res.json({
              status: "error",
              message: "Playlist movie not found",
            });
          }
        })
        .catch((error) => {});
    } else {
      res.json({
        status: "error",
        message: "Playlist movie not selected",
      });
    }
  }
);

function checkAuthorizationToken(req, res, next) {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.split(" ");

  if (token == null) {
    return res.sendStatus(401);
  }

  jwt.verify(token[0], jwt_key, (err, user) => {
    if (!err) {
      req.user = user;
      next();
    } else {
      res.sendStatus(403);
    }
  });
}

app.listen(PORT, function () {
  console.log(`App started on port ${PORT}`);
});
