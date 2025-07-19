const request = require('supertest');
const app = require('../app'); // seu arquivo principal Express

describe('Login API', () => {
  it('deve falhar com credenciais inválidas', async () => {
    const res = await request(app).post('/login').send({
      email: 'fake@email.com',
      password: 'errado'
    });
    expect(res.statusCode).toBe(401);
  });
});
