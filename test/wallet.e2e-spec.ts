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
});
