import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { TESTING_PATH, USERS_PATH } from '../../../src/core/paths/paths';

describe('Users API (e2e)', () => {
  const app = express();
  setupApp(app);

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);
  });

  afterAll(async () => {
    await client.close();
  });

  const correctAuthHeader = {
    Authorization: `Basic ${Buffer.from(
      `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`,
    ).toString('base64')}`,
  };

  const testUserData = {
    login: 'testuser',
    email: 'test@example.com',
    password: 'secret123',
  };

  it('✅ should create user; POST /users', async () => {
    const res = await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send(testUserData)
      .expect(HttpStatus.Created);

    expect(res.body).toEqual({
      id: expect.any(String),
      login: testUserData.login,
      email: testUserData.email,
      createdAt: expect.any(String),
    });

    // password hash не должен попасть в ответ
    expect(res.body.passwordHash).toBeUndefined();
    expect(res.body.password).toBeUndefined();
  });

  it('✅ should return users list; GET /users', async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);

    await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send({ ...testUserData, login: 'userOne', email: 'one@example.com' })
      .expect(HttpStatus.Created);

    await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send({ ...testUserData, login: 'userTwo', email: 'two@example.com' })
      .expect(HttpStatus.Created);

    const res = await request(app)
      .get(USERS_PATH)
      .set(correctAuthHeader)
      .expect(HttpStatus.Ok);

    expect(res.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayContaining([
        expect.objectContaining({ login: 'userOne' }),
        expect.objectContaining({ login: 'userTwo' }),
      ]),
    });
  });

  it('✅ should delete user; DELETE /users/:id and then return NOT FOUND on GET list', async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);

    const createRes = await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send(testUserData)
      .expect(HttpStatus.Created);

    const userId = createRes.body.id;

    await request(app)
      .delete(`${USERS_PATH}/${userId}`)
      .set(correctAuthHeader)
      .expect(HttpStatus.NoContent);

    const listRes = await request(app)
      .get(USERS_PATH)
      .set(correctAuthHeader)
      .expect(HttpStatus.Ok);

    expect(listRes.body.totalCount).toBe(0);
    expect(listRes.body.items).toHaveLength(0);
  });

  it('❌ should reject GET /users without authorization', async () => {
    await request(app).get(USERS_PATH).expect(HttpStatus.Unauthorized);
  });

  it('❌ should reject POST /users without authorization', async () => {
    await request(app)
      .post(USERS_PATH)
      .send(testUserData)
      .expect(HttpStatus.Unauthorized);
  });

  describe('GET /users — pagination', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post(USERS_PATH)
          .set(correctAuthHeader)
          .send({
            login: `user${i}`,
            email: `user${i}@example.com`,
            password: 'secret123',
          })
          .expect(HttpStatus.Created);
      }
    });

    it('✅ should return correct pagesCount and totalCount', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?pageSize=2`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(5);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.pagesCount).toBe(3);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return second page', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?pageSize=2&pageNumber=2`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(2);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return last page with remaining items', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?pageSize=2&pageNumber=3`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(3);
      expect(res.body.items).toHaveLength(1);
    });

    it('✅ should return empty items for page beyond range', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?pageSize=2&pageNumber=99`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.items).toHaveLength(0);
    });

    it('✅ should sort by createdAt desc by default', async () => {
      const res = await request(app)
        .get(USERS_PATH)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      const dates = res.body.items.map((u: any) =>
        new Date(u.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('✅ should sort by createdAt asc', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?sortBy=createdAt&sortDirection=asc`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      const dates = res.body.items.map((u: any) =>
        new Date(u.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('GET /users — search', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      await request(app)
        .post(USERS_PATH)
        .set(correctAuthHeader)
        .send({
          login: 'alice',
          email: 'alice@gmail.com',
          password: 'secret123',
        })
        .expect(HttpStatus.Created);

      await request(app)
        .post(USERS_PATH)
        .set(correctAuthHeader)
        .send({ login: 'bob', email: 'bob@yahoo.com', password: 'secret123' })
        .expect(HttpStatus.Created);

      await request(app)
        .post(USERS_PATH)
        .set(correctAuthHeader)
        .send({
          login: 'charlie',
          email: 'charlie@gmail.com',
          password: 'secret123',
        })
        .expect(HttpStatus.Created);
    });

    it('✅ should find users by searchLoginTerm', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?searchLoginTerm=ali`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(1);
      expect(res.body.items[0].login).toBe('alice');
    });

    it('✅ should find users by searchEmailTerm', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?searchEmailTerm=gmail`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(2);
      res.body.items.forEach((u: any) => {
        expect(u.email).toMatch(/gmail/);
      });
    });

    it('✅ should combine searchLoginTerm and searchEmailTerm via OR', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?searchLoginTerm=bob&searchEmailTerm=gmail`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      // bob (by login) + alice + charlie (by email gmail) = 3
      expect(res.body.totalCount).toBe(3);
    });

    it('✅ should return empty when no matches', async () => {
      const res = await request(app)
        .get(`${USERS_PATH}?searchLoginTerm=zzznomatch`)
        .set(correctAuthHeader)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });
  });
});
