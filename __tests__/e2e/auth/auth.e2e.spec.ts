import request from 'supertest';
import express from 'express';
import jwt from 'jsonwebtoken';
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

  let accessToken: string;

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

  describe('POST /auth/login', () => {
    it('✅ should login with correct login and return accessToken', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: testUser.login, password: testUser.password })
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
      accessToken = res.body.accessToken;
    });

    it('✅ should login with correct email and return accessToken', async () => {
      const res = await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: testUser.email, password: testUser.password })
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({ accessToken: expect.any(String) });
    });

    it('❌ should return 401 with wrong password', async () => {
      await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: testUser.login, password: 'wrongpassword' })
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with non-existing login', async () => {
      await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({ loginOrEmail: 'nobody', password: testUser.password })
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with non-existing email', async () => {
      await request(app)
        .post(`${AUTH_PATH}/login`)
        .send({
          loginOrEmail: 'nobody@example.com',
          password: testUser.password,
        })
        .expect(HttpStatus.Unauthorized);
    });

    describe('body validation', () => {
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

  describe('GET /auth/me', () => {
    it('✅ should return current user info with valid JWT', async () => {
      const res = await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', `Bearer ${accessToken}`)
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({
        login: testUser.login,
        email: testUser.email,
        userId: expect.any(String),
      });
    });

    it('❌ should return 401 when no Authorization header', async () => {
      await request(app).get(`${AUTH_PATH}/me`).expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 when Authorization header has no Bearer prefix', async () => {
      await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', accessToken)
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with invalid (garbage) token', async () => {
      await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', 'Bearer not.a.valid.token')
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with token signed by wrong secret', async () => {
      const fakeToken = jwt.sign(
        { userId: 'fakeid', userLogin: testUser.login },
        'wrong_secret',
        { expiresIn: 3600 },
      );

      await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', `Bearer ${fakeToken}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with expired token', async () => {
      const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
      const expiredToken = jwt.sign(
        { userId: 'someid', userLogin: testUser.login },
        JWT_SECRET,
        { expiresIn: -1 },
      );

      await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 401 with empty Bearer token', async () => {
      await request(app)
        .get(`${AUTH_PATH}/me`)
        .set('Authorization', 'Bearer ')
        .expect(HttpStatus.Unauthorized);
    });
  });
});
