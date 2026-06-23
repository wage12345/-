const pool = require('../config/db');

async function findAll(keyword) {
  if (keyword) {
    const likeKeyword = `%${keyword}%`;
    const [rows] = await pool.query(
      `SELECT * FROM students
       WHERE student_no LIKE ? OR name LIKE ? OR class_name LIKE ?
       ORDER BY id DESC`,
      [likeKeyword, likeKeyword, likeKeyword]
    );
    return rows;
  }

  const [rows] = await pool.query('SELECT * FROM students ORDER BY id DESC');
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query('SELECT * FROM students WHERE id = ? LIMIT 1', [id]);
  return rows[0];
}

async function findByStudentNo(studentNo) {
  const [rows] = await pool.query(
    'SELECT * FROM students WHERE student_no = ? LIMIT 1',
    [studentNo]
  );
  return rows[0];
}

async function findByStudentNoExceptId(studentNo, id) {
  const [rows] = await pool.query(
    'SELECT * FROM students WHERE student_no = ? AND id <> ? LIMIT 1',
    [studentNo, id]
  );
  return rows[0];
}

async function create(student) {
  const { student_no, name, gender, class_name, phone } = student;
  const [result] = await pool.query(
    `INSERT INTO students (student_no, name, gender, class_name, phone)
     VALUES (?, ?, ?, ?, ?)`,
    [student_no, name, gender, class_name, phone]
  );
  return result.insertId;
}

async function update(id, student) {
  const { student_no, name, gender, class_name, phone } = student;
  await pool.query(
    `UPDATE students
     SET student_no = ?, name = ?, gender = ?, class_name = ?, phone = ?
     WHERE id = ?`,
    [student_no, name, gender, class_name, phone, id]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM students WHERE id = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByStudentNo,
  findByStudentNoExceptId,
  create,
  update,
  remove
};