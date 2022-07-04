module.exports = function MovieDB(pool) {
  async function listPlaylistMovies(user_id) {
    const result = await pool.query(
      `SELECT * FROM movie_playlist WHERE user_id = $1`,
      [user_id]
    );
    return result.rows;
  }

  async function addPlaylistMovie(movie_id, movie_name, movie_poster, user_id) {
    const result = await pool.query(
      `INSERT INTO movie_playlist(movie_id,movie_name,movie_poster,user_id) VALUES($1,$2,$3,$4); `,
      [movie_id, movie_name, movie_poster, user_id]
    );

    return result.rowCount;
  }

  async function deletePlaylistMovie(movie_id, user_id) {
    const result = await pool.query(
      `DELETE FROM movie_playlist WHERE movie_id = $1 AND user_id = $2;`,
      [movie_id, user_id]
    );

    return result.rowCount;
  }

  async function checkMovie(movie_id, user_id) {
    const result = await pool.query(
      `SELECT COUNT(playlist_id) as movies FROM movie_playlist WHERE movie_id = $1 AND user_id = $2;`,
      [movie_id, user_id]
    );

    return result.rows[0];
  }

  return {
    listPlaylistMovies,
    addPlaylistMovie,
    deletePlaylistMovie,
    checkMovie,
  };
};
