const pool = require('./db');

const ADMIN_PASSWORD_HASH =
  '$2b$10$ur0oVamA7CA5zxe/ilKtb.oBYkW7UJIjw9waLEKC/UCWIa4z5zFsu';

async function tableExists(tableName) {
  const [rows] = await pool.query('SHOW TABLES LIKE ?', [tableName]);
  return rows.length > 0;
}

async function columnExists(tableName, columnName) {
  const [rows] = await pool.query(`SHOW COLUMNS FROM \`${tableName}\` LIKE ?`, [columnName]);
  return rows.length > 0;
}

async function ensureColumn(tableName, columnName, definitionSql) {
  const exists = await columnExists(tableName, columnName);
  if (!exists) {
    await pool.query(`ALTER TABLE \`${tableName}\` ADD COLUMN \`${columnName}\` ${definitionSql}`);
  }
}

async function ensureUsersTable() {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS users (
      id INT PRIMARY KEY AUTO_INCREMENT,
      username VARCHAR(50) NOT NULL UNIQUE,
      password VARCHAR(255) NOT NULL
    )
  `);

  await pool.query(
    `INSERT INTO users (username, password)
     VALUES ('admin', ?)
     ON DUPLICATE KEY UPDATE username = username`,
    [ADMIN_PASSWORD_HASH]
  );
}

async function ensureClassesTable() {
  const exists = await tableExists('classes');

  if (!exists) {
    await pool.query(`
      CREATE TABLE classes (
        id INT PRIMARY KEY AUTO_INCREMENT,
        class_name VARCHAR(60) NOT NULL UNIQUE,
        grade VARCHAR(20) NOT NULL,
        major VARCHAR(50) NOT NULL,
        counselor VARCHAR(50) NOT NULL,
        monitor_name VARCHAR(50) DEFAULT NULL,
        student_capacity INT NOT NULL DEFAULT 40,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    await ensureColumn('classes', 'grade', "VARCHAR(20) NOT NULL DEFAULT '未设置'");
    await ensureColumn('classes', 'major', "VARCHAR(50) NOT NULL DEFAULT '未设置'");
    await ensureColumn('classes', 'counselor', "VARCHAR(50) NOT NULL DEFAULT '待分配'");
    await ensureColumn('classes', 'monitor_name', 'VARCHAR(50) DEFAULT NULL');
    await ensureColumn('classes', 'student_capacity', 'INT NOT NULL DEFAULT 40');
    await ensureColumn('classes', 'created_at', 'TIMESTAMP DEFAULT CURRENT_TIMESTAMP');
  }
}

async function ensureStudentsTable() {
  const exists = await tableExists('students');

  if (!exists) {
    await pool.query(`
      CREATE TABLE students (
        id INT PRIMARY KEY AUTO_INCREMENT,
        student_no VARCHAR(30) NOT NULL UNIQUE,
        name VARCHAR(50) NOT NULL,
        gender VARCHAR(10) NOT NULL,
        class_name VARCHAR(60) NOT NULL,
        phone VARCHAR(20),
        email VARCHAR(100),
        birthday DATE,
        status VARCHAR(20) NOT NULL DEFAULT '在读',
        dormitory VARCHAR(50),
        emergency_contact VARCHAR(50),
        emergency_phone VARCHAR(20),
        notes TEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);
  } else {
    await ensureColumn('students', 'email', 'VARCHAR(100)');
    await ensureColumn('students', 'birthday', 'DATE');
    await ensureColumn('students', 'status', "VARCHAR(20) NOT NULL DEFAULT '在读'");
    await ensureColumn('students', 'dormitory', 'VARCHAR(50)');
    await ensureColumn('students', 'emergency_contact', 'VARCHAR(50)');
    await ensureColumn('students', 'emergency_phone', 'VARCHAR(20)');
    await ensureColumn('students', 'notes', 'TEXT');
  }

  await pool.query("UPDATE students SET status = '在读' WHERE status IS NULL OR status = ''");
}

async function seedClassesFromStudents() {
  await pool.query(`
    INSERT INTO classes (class_name, grade, major, counselor, monitor_name, student_capacity)
    SELECT DISTINCT s.class_name, '未设置', '未设置', '待分配', NULL, 40
    FROM students s
    WHERE s.class_name IS NOT NULL
      AND s.class_name <> ''
      AND NOT EXISTS (
        SELECT 1
        FROM classes c
        WHERE c.class_name = s.class_name
      )
  `);
}

async function ensureSchema() {
  await ensureUsersTable();
  await ensureClassesTable();
  await ensureStudentsTable();
  await seedClassesFromStudents();
}

module.exports = {
  ensureSchema
};
