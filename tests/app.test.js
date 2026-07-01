jest.mock('../models/userModel', () => ({
  findByUsername: jest.fn()
}));

jest.mock('../models/studentModel', () => ({
  countAll: jest.fn(),
  findPage: jest.fn(),
  countByGender: jest.fn(),
  countByClass: jest.fn(),
  countByStatus: jest.fn(),
  findRecent: jest.fn(),
  findById: jest.fn(),
  findByStudentNo: jest.fn(),
  findByStudentNoExceptId: jest.fn(),
  findAll: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  remove: jest.fn()
}));

jest.mock('../models/classModel', () => ({
  findAll: jest.fn(),
  findById: jest.fn(),
  findByName: jest.fn(),
  findNames: jest.fn(),
  existsByName: jest.fn(),
  existsByNameExceptId: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  renameStudents: jest.fn(),
  countStudentsByName: jest.fn(),
  remove: jest.fn()
}));

const request = require('supertest');
const app = require('../app');
const userModel = require('../models/userModel');
const studentModel = require('../models/studentModel');
const classModel = require('../models/classModel');

function mockStudents() {
  return [
    {
      id: 1,
      student_no: '2026001',
      name: '张三',
      gender: '男',
      class_name: '软件工程 1 班',
      phone: '13800000001',
      email: 'zhangsan@example.com',
      dormitory: 'A2-305',
      emergency_phone: '13900000001',
      status: '在读',
      created_at: new Date('2026-06-20T08:00:00Z')
    },
    {
      id: 2,
      student_no: '2026002',
      name: '李四',
      gender: '女',
      class_name: '软件工程 1 班',
      phone: '13800000002',
      email: 'lisi@example.com',
      dormitory: 'B1-214',
      emergency_phone: '13900000002',
      status: '实习',
      created_at: new Date('2026-06-21T08:00:00Z')
    }
  ];
}

function mockClasses() {
  return [
    {
      id: 1,
      class_name: '软件工程 1 班',
      grade: '2026',
      major: '软件工程',
      counselor: '周老师',
      monitor_name: '张三',
      student_capacity: 42,
      student_count: 2,
      active_student_count: 1
    },
    {
      id: 2,
      class_name: '人工智能 1 班',
      grade: '2026',
      major: '人工智能',
      counselor: '陈老师',
      monitor_name: '陈晨',
      student_capacity: 36,
      student_count: 1,
      active_student_count: 1
    }
  ];
}

describe('student management system routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    userModel.findByUsername.mockResolvedValue({
      id: 1,
      username: 'admin',
      password: '$2b$10$ur0oVamA7CA5zxe/ilKtb.oBYkW7UJIjw9waLEKC/UCWIa4z5zFsu'
    });
  });

  test('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });

  test('GET /login should render login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('学生信息管理系统');
    expect(res.text).toContain('账号登录');
  });

  test('GET /students without login should redirect to /login', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });

  test('GET /students should render dashboard when logged in', async () => {
    const agent = request.agent(app);

    studentModel.countAll.mockResolvedValue(2);
    studentModel.findPage.mockResolvedValue(mockStudents());
    studentModel.countByGender.mockResolvedValue([{ gender: '男', total: 1 }, { gender: '女', total: 1 }]);
    studentModel.countByClass.mockResolvedValue([{ class_name: '软件工程 1 班', total: 2 }]);
    studentModel.countByStatus.mockResolvedValue([{ status: '在读', total: 1 }, { status: '实习', total: 1 }]);
    studentModel.findRecent.mockResolvedValue(mockStudents());
    classModel.findAll.mockResolvedValue(mockClasses());

    await agent.post('/login').type('form').send({ username: 'admin', password: '123456' });
    const res = await agent.get('/students');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('学生信息总览');
    expect(res.text).toContain('学生列表');
    expect(res.text).toContain('张三');
    expect(res.text).toContain('班级');
  });

  test('GET /students/export should download csv when logged in', async () => {
    const agent = request.agent(app);

    studentModel.findAll.mockResolvedValue(mockStudents());

    await agent.post('/login').type('form').send({ username: 'admin', password: '123456' });
    const res = await agent.get('/students/export');

    expect(res.statusCode).toBe(200);
    expect(res.headers['content-type']).toContain('text/csv');
    expect(res.text).toContain('学号');
    expect(res.text).toContain('张三');
  });

  test('GET /classes should render class dashboard when logged in', async () => {
    const agent = request.agent(app);

    classModel.findAll.mockResolvedValue(mockClasses());

    await agent.post('/login').type('form').send({ username: 'admin', password: '123456' });
    const res = await agent.get('/classes');

    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('班级管理面板');
    expect(res.text).toContain('软件工程 1 班');
    expect(res.text).toContain('周老师');
  });
});
