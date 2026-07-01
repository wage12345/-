const pool = require('../config/db');

function buildWhereClause(filters = {}) {
  const conditions = [];
  const params = [];

  if (filters.keyword) {
    const likeKeyword = `%${filters.keyword}%`;
    conditions.push(
      '(student_no LIKE ? OR name LIKE ? OR class_name LIKE ? OR phone LIKE ? OR email LIKE ?)'
    );
    params.push(likeKeyword, likeKeyword, likeKeyword, likeKeyword, likeKeyword);
  }

  if (filters.gender) {
    conditions.push('gender = ?');
    params.push(filters.gender);
  }

  if (filters.class_name) {
    conditions.push('class_name = ?');
    params.push(filters.class_name);
  }

  if (filters.status) {
    conditions.push('status = ?');
    params.push(filters.status);
  }

  const where = conditions.length ? `WHERE ${conditions.join(' AND ')}` : '';
  return { where, params };
}

async function findAll(filters = {}) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT * FROM students
     ${where}
     ORDER BY id DESC`,
    params
  );
  return rows;
}

async function findPage(filters = {}, limit = 10, offset = 0) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT * FROM students
     ${where}
     ORDER BY id DESC
     LIMIT ? OFFSET ?`,
    [...params, Number(limit), Number(offset)]
  );
  return rows;
}

async function countAll(filters = {}) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT COUNT(*) AS total
     FROM students
     ${where}`,
    params
  );
  return rows[0].total;
}

async function countByGender(filters = {}) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT gender, COUNT(*) AS total
     FROM students
     ${where}
     GROUP BY gender`,
    params
  );
  return rows;
}

async function countByClass(filters = {}) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT class_name, COUNT(*) AS total
     FROM students
     ${where}
     GROUP BY class_name
     ORDER BY total DESC, class_name ASC`,
    params
  );
  return rows;
}

async function countByStatus(filters = {}) {
  const { where, params } = buildWhereClause(filters);
  const [rows] = await pool.query(
    `SELECT status, COUNT(*) AS total
     FROM students
     ${where}
     GROUP BY status
     ORDER BY total DESC`,
    params
  );
  return rows;
}

async function findRecent(limit = 5) {
  const [rows] = await pool.query(
    'SELECT * FROM students ORDER BY created_at DESC, id DESC LIMIT ?',
    [Number(limit)]
  );
  return rows;
}

async function findDistinctClasses() {
  const [rows] = await pool.query(
    'SELECT DISTINCT class_name FROM students ORDER BY class_name ASC'
  );
  return rows.map((row) => row.class_name);
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
  const {
    student_no,
    name,
    gender,
    class_name,
    phone,
    email,
    birthday,
    status,
    dormitory,
    emergency_contact,
    emergency_phone,
    notes
  } = student;

  const [result] = await pool.query(
    `INSERT INTO students (
      student_no, name, gender, class_name, phone, email, birthday, status,
      dormitory, emergency_contact, emergency_phone, notes
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
    [
      student_no,
      name,
      gender,
      class_name,
      phone,
      email,
      birthday || null,
      status,
      dormitory,
      emergency_contact,
      emergency_phone,
      notes
    ]
  );
  return result.insertId;
}

async function update(id, student) {
  const {
    student_no,
    name,
    gender,
    class_name,
    phone,
    email,
    birthday,
    status,
    dormitory,
    emergency_contact,
    emergency_phone,
    notes
  } = student;

  await pool.query(
    `UPDATE students
     SET student_no = ?, name = ?, gender = ?, class_name = ?, phone = ?, email = ?,
         birthday = ?, status = ?, dormitory = ?, emergency_contact = ?, emergency_phone = ?, notes = ?
     WHERE id = ?`,
    [
      student_no,
      name,
      gender,
      class_name,
      phone,
      email,
      birthday || null,
      status,
      dormitory,
      emergency_contact,
      emergency_phone,
      notes,
      id
    ]
  );
}

async function remove(id) {
  await pool.query('DELETE FROM students WHERE id = ?', [id]);
}

module.exports = {
  findAll,
  findPage,
  countAll,
  countByGender,
  countByClass,
  countByStatus,
  findRecent,
  findDistinctClasses,
  findById,
  findByStudentNo,
  findByStudentNoExceptId,
  create,
  update,
  remove
};
