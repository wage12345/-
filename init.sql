CREATE DATABASE IF NOT EXISTS student_manage DEFAULT CHARACTER SET utf8mb4;
USE student_manage;

CREATE TABLE IF NOT EXISTS users (
  id INT PRIMARY KEY AUTO_INCREMENT,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL
);

CREATE TABLE IF NOT EXISTS students (
  id INT PRIMARY KEY AUTO_INCREMENT,
  student_no VARCHAR(30) NOT NULL UNIQUE,
  name VARCHAR(50) NOT NULL,
  gender VARCHAR(10) NOT NULL,
  class_name VARCHAR(50) NOT NULL,
  phone VARCHAR(20),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

INSERT INTO users (username, password)
VALUES ('admin', '$2b$10$ur0oVamA7CA5zxe/ilKtb.oBYkW7UJIjw9waLEKC/UCWIa4z5zFsu')
ON DUPLICATE KEY UPDATE username = username;

INSERT INTO students (student_no, name, gender, class_name, phone)
VALUES
('2026001', '张三', '男', '软件工程1班', '13800000001'),
('2026002', '李四', '女', '软件工程1班', '13800000002'),
('2026003', '王五', '男', '软件工程2班', '13800000003')
ON DUPLICATE KEY UPDATE student_no = student_no;