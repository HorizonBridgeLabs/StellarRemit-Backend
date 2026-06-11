import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { AppModule } from '../src/app.module';

describe('TransactionsController (e2e)', () => {
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

  it('GET /api/v1/transactions returns 401 without token', () => {
    return request(app.getHttpServer()).get('/api/v1/transactions').expect(401);
  });

  it('POST /api/v1/transactions returns 401 without token', () => {
    return request(app.getHttpServer())
      .post('/api/v1/transactions')
      .send({ recipient: 'GABC123', amount: 10 })
      .expect(401);
  });
});
