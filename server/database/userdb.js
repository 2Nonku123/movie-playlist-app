module.exports = function UserDB(pool) {
  async function registerUser(user_name, password, first_name, surname) {
    const result = await pool.query(
      `INSERT INTO movie_users(user_name,password,first_name,surname) VALUES($1,$2,$3,$4); `,
      [user_name, password, first_name, surname]
    );

    return result.rowCount;
  }

  async function updateUser(first_name, surname) {}

  async function updatePassword(password) {}

  async function getUser(user_name) {
    const result = await pool.query(
      `select * from movie_users where user_name = $1`,
      [user_name]
    );

    return result.rowCount > 0 ? result.rows[0] : null;
  }

  return {
    getUser,
    registerUser,
    updateUser,
    updatePassword,
  };
};
