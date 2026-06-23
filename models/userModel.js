const pool = require('../config/db');

async function findByUsername(username) {
  const [rows] = await pool.query(
    'SELECT * FROM users WHERE username = ? LIMIT 1',
    [username]
  );
  return rows[0];
}

module.exports = {
  findByUsername
};