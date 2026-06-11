import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('AuthController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterEach(async () => {
    await app.close();
  });

  it('POST /api/v1/auth/register returns 400 for invalid payload', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/register')
      .send({ email: 'not-an-email', password: 'short' })
      .expect(400);
  });

  it('POST /api/v1/auth/login returns 401 for invalid credentials', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/login')
      .send({ email: 'test@example.com', password: 'wrongpassword' })
      .expect(401);
  });

  it('POST /api/v1/auth/register returns 400 for missing email', () => {
    return request(app.getHttpServer()).post('/api/v1/auth/register').send({ password: 'password123' }).expect(400);
  });

  it('POST /api/v1/auth/register returns 400 for missing password', () => {
    return request(app.getHttpServer()).post('/api/v1/auth/register').send({ email: 'test@example.com' }).expect(400);
  });

  it('POST /api/v1/auth/login returns 400 for missing email', () => {
    return request(app.getHttpServer()).post('/api/v1/auth/login').send({ password: 'password123' }).expect(400);
  });

  it('POST /api/v1/auth/refresh returns 400 for missing token', () => {
    return request(app.getHttpServer()).post('/api/v1/auth/refresh').send({}).expect(400);
  });

  it('POST /api/v1/auth/refresh returns 401 for invalid token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/auth/refresh')
      .send({ refreshToken: 'invalid-token' })
      .expect(401);
  });

  it('GET /api/v1/auth/me returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/auth/me').expect(401);
  });

  it('POST /api/v1/auth/logout returns 401 without token', () => {
    return request(app.getHttpServer()).post('/api/v1/auth/logout').send({}).expect(401);
  });
});
