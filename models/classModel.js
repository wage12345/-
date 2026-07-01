const pool = require('../config/db');

async function findAll() {
  const [rows] = await pool.query(
    `SELECT c.*,
            COUNT(s.id) AS student_count,
            SUM(CASE WHEN s.status = '在读' THEN 1 ELSE 0 END) AS active_student_count
     FROM classes c
     LEFT JOIN students s ON s.class_name = c.class_name
     GROUP BY c.id
     ORDER BY c.grade DESC, c.class_name ASC`
  );
  return rows;
}

async function findById(id) {
  const [rows] = await pool.query(
    `SELECT c.*,
            COUNT(s.id) AS student_count,
            SUM(CASE WHEN s.status = '在读' THEN 1 ELSE 0 END) AS active_student_count
     FROM classes c
     LEFT JOIN students s ON s.class_name = c.class_name
     WHERE c.id = ?
     GROUP BY c.id
     LIMIT 1`,
    [id]
  );
  return rows[0];
}

async function findByName(className) {
  const [rows] = await pool.query(
    `SELECT c.*,
            COUNT(s.id) AS student_count,
            SUM(CASE WHEN s.status = '在读' THEN 1 ELSE 0 END) AS active_student_count
     FROM classes c
     LEFT JOIN students s ON s.class_name = c.class_name
     WHERE c.class_name = ?
     GROUP BY c.id
     LIMIT 1`,
    [className]
  );
  return rows[0];
}

async function findNames() {
  const [rows] = await pool.query('SELECT class_name FROM classes ORDER BY grade DESC, class_name ASC');
  return rows.map((row) => row.class_name);
}

async function existsByName(className) {
  const [rows] = await pool.query('SELECT id FROM classes WHERE class_name = ? LIMIT 1', [className]);
  return rows[0];
}

async function existsByNameExceptId(className, id) {
  const [rows] = await pool.query(
    'SELECT id FROM classes WHERE class_name = ? AND id <> ? LIMIT 1',
    [className, id]
  );
  return rows[0];
}

async function create(classItem) {
  const {
    class_name,
    grade,
    major,
    counselor,
    monitor_name,
    student_capacity
  } = classItem;

  const [result] = await pool.query(
    `INSERT INTO classes (class_name, grade, major, counselor, monitor_name, student_capacity)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [class_name, grade, major, counselor, monitor_name, student_capacity]
  );
  return result.insertId;
}

async function update(id, classItem) {
  const {
    class_name,
    grade,
    major,
    counselor,
    monitor_name,
    student_capacity
  } = classItem;

  await pool.query(
    `UPDATE classes
     SET class_name = ?, grade = ?, major = ?, counselor = ?, monitor_name = ?, student_capacity = ?
     WHERE id = ?`,
    [class_name, grade, major, counselor, monitor_name, student_capacity, id]
  );
}

async function renameStudents(oldName, newName) {
  await pool.query('UPDATE students SET class_name = ? WHERE class_name = ?', [newName, oldName]);
}

async function countStudentsByName(className) {
  const [rows] = await pool.query('SELECT COUNT(*) AS total FROM students WHERE class_name = ?', [className]);
  return rows[0].total;
}

async function remove(id) {
  await pool.query('DELETE FROM classes WHERE id = ?', [id]);
}

module.exports = {
  findAll,
  findById,
  findByName,
  findNames,
  existsByName,
  existsByNameExceptId,
  create,
  update,
  renameStudents,
  countStudentsByName,
  remove
};
