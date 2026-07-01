SET NAMES utf8mb4;

CREATE DATABASE IF NOT EXISTS student_manage DEFAULT CHARACTER SET utf8mb4;
USE student_manage;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS classes (
  id INT PRIMARY KEY AUTO_INCREMENT,
  class_name VARCHAR(60) NOT NULL UNIQUE,
  grade VARCHAR(20) NOT NULL,
  major VARCHAR(50) NOT NULL,
  counselor VARCHAR(50) NOT NULL,
  monitor_name VARCHAR(50) DEFAULT NULL,
  student_capacity INT NOT NULL DEFAULT 40,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS students (
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
) DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

INSERT INTO users (username, password)
VALUES ('admin', '$2b$10$ur0oVamA7CA5zxe/ilKtb.oBYkW7UJIjw9waLEKC/UCWIa4z5zFsu')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO classes (class_name, grade, major, counselor, monitor_name, student_capacity)
VALUES
('软件工程 1 班', '2026', '软件工程', '周老师', '张三', 42),
('软件工程 2 班', '2026', '软件工程', '周老师', '王五', 40),
('数据科学 1 班', '2026', '数据科学', '刘老师', '赵敏', 38),
('人工智能 1 班', '2026', '人工智能', '陈老师', '陈晨', 36)
ON DUPLICATE KEY UPDATE class_name = class_name;

INSERT INTO students (
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
)
VALUES
('2026001', '张三', '男', '软件工程 1 班', '13800000001', 'zhangsan@example.com', '2007-03-12', '在读', 'A2-305', '张建国', '13900000001', '负责班级活动组织。'),
('2026002', '李四', '女', '软件工程 1 班', '13800000002', 'lisi@example.com', '2007-07-21', '在读', 'B1-214', '李红', '13900000002', '综合成绩稳定。'),
('2026003', '王五', '男', '软件工程 2 班', '13800000003', 'wangwu@example.com', '2007-01-09', '在读', 'A3-118', '王建平', '13900000003', '担任学习委员。'),
('2026004', '赵敏', '女', '数据科学 1 班', '13800000004', 'zhaomin@example.com', '2007-11-03', '实习', 'C2-406', '赵国华', '13900000004', '正在企业实习。'),
('2026005', '陈晨', '男', '人工智能 1 班', '13800000005', 'chenchen@example.com', '2007-05-16', '在读', 'A1-509', '陈秀兰', '13900000005', '参与算法竞赛训练。')
ON DUPLICATE KEY UPDATE student_no = student_no;
