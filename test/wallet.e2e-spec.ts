import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/app.module';

describe('WalletController (e2e)', () => {
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

  it('GET /api/v1/wallet returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/wallet').expect(401);
  });

  it('GET /api/v1/wallet/balance returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/wallet/balance').expect(401);
  });

  it('GET /api/v1/wallet/total-balance returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/wallet/total-balance').expect(401);
  });

  it('POST /api/v1/wallet returns 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallet')
      .send({ publicKey: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
      .expect(401);
  });

  it('POST /api/v1/wallet/create returns 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallet/create')
      .send({ publicKey: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X', label: 'Test' })
      .expect(401);
  });

  it('POST /api/v1/wallet/fund returns 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/wallet/fund')
      .send({ publicKey: 'GAAJGOXTBVD6FNOF2EJ2IWOXY4XWV5Q5JHQWQE2PTFS3N2F4K6OS4Q5X' })
      .expect(401);
  });

  it('PATCH /api/v1/wallet/:id/default returns 401 without token', () => {
    return request(app.getHttpServer()).patch('/api/v1/wallet/some-id/default').expect(401);
  });

  it('DELETE /api/v1/wallet/:id returns 401 without token', () => {
    return request(app.getHttpServer()).delete('/api/v1/wallet/some-id').expect(401);
  });

  it('GET /api/v1/wallet/:id/balance returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/wallet/some-id/balance').expect(401);
  });

  it('GET /api/v1/wallet/:id/transactions returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/wallet/some-id/transactions').expect(401);
  });
});
