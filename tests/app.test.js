const request = require('supertest');
const app = require('../app');

describe('student management system basic routes', () => {
  test('GET /health should return ok', async () => {
    const res = await request(app).get('/health');
    expect(res.statusCode).toBe(200);
    expect(res.text).toBe('ok');
  });

  test('GET /login should render login page', async () => {
    const res = await request(app).get('/login');
    expect(res.statusCode).toBe(200);
    expect(res.text).toContain('学生信息管理系统');
  });

  test('GET /students without login should redirect to /login', async () => {
    const res = await request(app).get('/students');
    expect(res.statusCode).toBe(302);
    expect(res.headers.location).toBe('/login');
  });
});