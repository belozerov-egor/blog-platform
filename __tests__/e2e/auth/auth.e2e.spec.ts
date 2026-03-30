import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import {
  AUTH_PATH,
  TESTING_PATH,
  USERS_PATH,
} from '../../../src/core/paths/paths';

describe('Auth API (e2e)', () => {
  const app = express();
  setupApp(app);

  const correctAuthHeader = {
    Authorization: `Basic ${Buffer.from(
      `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`,
    ).toString('base64')}`,
  };

  const testUser = {
    login: 'testuser',
    email: 'test@example.com',
    password: 'secret123',
  };

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);

    await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send(testUser)
      .expect(HttpStatus.Created);
  });

  afterAll(async () => {
    await client.close();
  });

  it('✅ should login with correct login; POST /auth/login', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: testUser.login, password: testUser.password })
      .expect(HttpStatus.NoContent);
  });

  it('✅ should login with correct email; POST /auth/login', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: testUser.email, password: testUser.password })
      .expect(HttpStatus.NoContent);
  });

  it('❌ should return 401 with wrong password; POST /auth/login', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: testUser.login, password: 'wrongpassword' })
      .expect(HttpStatus.Unauthorized);
  });

  it('❌ should return 401 with non-existing login; POST /auth/login', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: 'nobody', password: testUser.password })
      .expect(HttpStatus.Unauthorized);
  });

  it('❌ should return 401 with non-existing email; POST /auth/login', async () => {
    await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: 'nobody@example.com', password: testUser.password })
      .expect(HttpStatus.Unauthorized);
  });

  describe('POST /auth/login — body validation', () => {
    it('❌ should return 400 when loginOrEmail is missing', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ password: testUser.password })
        .expect(HttpStatus.BadRequest);

      expect(res.body).toEqual({
        errorsMessages: expect.arrayContaining([
          expect.objectContaining({ field: 'loginOrEmail' }),
        ]),
      });
    });

    it('❌ should return 400 when password is missing', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: testUser.login })
        .expect(HttpStatus.BadRequest);

      expect(res.body).toEqual({
        errorsMessages: expect.arrayContaining([
          expect.objectContaining({ field: 'password' }),
        ]),
      });
    });

    it('❌ should return 400 when both fields are empty strings', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: '', password: '' })
        .expect(HttpStatus.BadRequest);

      expect(res.body.errorsMessages).toHaveLength(2);
    });

    it('❌ should return 400 when body is empty', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({})
        .expect(HttpStatus.BadRequest);

      expect(res.body).toEqual({
        errorsMessages: expect.any(Array),
      });
    });
  });
});
