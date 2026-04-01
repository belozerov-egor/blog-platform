import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import {
  AUTH_PATH,
  COMMENTS_PATH,
  TESTING_PATH,
  USERS_PATH,
} from '../../../src/core/paths/paths';

describe('Comments API (e2e)', () => {
  const app = express();
  setupApp(app);

  const correctAuthHeader = {
    Authorization: `Basic ${Buffer.from(
      `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`,
    ).toString('base64')}`,
  };

  const userOne = {
    login: 'ownerUser',
    email: 'owner@example.com',
    password: 'password123',
  };
  const userTwo = {
    login: 'otherUser',
    email: 'other@example.com',
    password: 'password456',
  };

  let tokenOne: string;
  let tokenTwo: string;
  let postId: string;
  let commentId: string;

  const validContent = 'This is a valid comment content text';
  const updatedContent = 'This is the updated comment content text';

  beforeAll(async () => {
    await runDB(SETTINGS.MONGO_URL);
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);

    const blogRes = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({
        name: 'Comment blog',
        description: 'desc',
        websiteUrl: 'https://example.com',
      })
      .expect(HttpStatus.Created);

    const postRes = await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({
        title: 'Post for comments',
        shortDescription: 'desc',
        content: 'content',
        blogId: blogRes.body.id,
      })
      .expect(HttpStatus.Created);

    postId = postRes.body.id;

    await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send(userOne)
      .expect(HttpStatus.Created);

    await request(app)
      .post(USERS_PATH)
      .set(correctAuthHeader)
      .send(userTwo)
      .expect(HttpStatus.Created);

    const loginOne = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: userOne.login, password: userOne.password })
      .expect(HttpStatus.Ok);
    tokenOne = loginOne.body.accessToken;

    const loginTwo = await request(app)
      .post(`${AUTH_PATH}/login`)
      .send({ loginOrEmail: userTwo.login, password: userTwo.password })
      .expect(HttpStatus.Ok);
    tokenTwo = loginTwo.body.accessToken;

    const commentRes = await request(app)
      .post(`/posts/${postId}/comments`)
      .set('Authorization', `Bearer ${tokenOne}`)
      .send({ content: validContent })
      .expect(HttpStatus.Created);

    commentId = commentRes.body.id;
  });

  afterAll(async () => {
    await client.close();
  });

  describe('GET /comments/:id', () => {
    it('✅ should return comment by id', async () => {
      const res = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .expect(HttpStatus.Ok);

      expect(res.body).toEqual({
        id: commentId,
        content: validContent,
        commentatorInfo: {
          userId: expect.any(String),
          userLogin: userOne.login,
        },
        createdAt: expect.any(String),
      });
    });

    it('❌ should return 404 for non-existing comment', async () => {
      await request(app)
        .get(`${COMMENTS_PATH}/000000000000000000000000`)
        .expect(HttpStatus.NotFound);
    });
  });

  describe('PUT /comments/:id', () => {
    it('✅ should update own comment', async () => {
      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${tokenOne}`)
        .send({ content: updatedContent })
        .expect(HttpStatus.NoContent);

      const res = await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .expect(HttpStatus.Ok);

      expect(res.body.content).toBe(updatedContent);
    });

    it('❌ should return 401 without JWT', async () => {
      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}`)
        .send({ content: updatedContent })
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 403 when trying to update another user comment', async () => {
      await request(app)
        .put(`${COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${tokenTwo}`)
        .send({ content: updatedContent })
        .expect(HttpStatus.Forbidden);
    });

    it('❌ should return 404 for non-existing comment', async () => {
      await request(app)
        .put(`${COMMENTS_PATH}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenOne}`)
        .send({ content: updatedContent })
        .expect(HttpStatus.NotFound);
    });

    describe('body validation', () => {
      it('❌ should return 400 when content is missing', async () => {
        const res = await request(app)
          .put(`${COMMENTS_PATH}/${commentId}`)
          .set('Authorization', `Bearer ${tokenOne}`)
          .send({})
          .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
          errorsMessages: expect.arrayContaining([
            expect.objectContaining({ field: 'content' }),
          ]),
        });
      });

      it('❌ should return 400 when content is too short (< 20 chars)', async () => {
        const res = await request(app)
          .put(`${COMMENTS_PATH}/${commentId}`)
          .set('Authorization', `Bearer ${tokenOne}`)
          .send({ content: 'Short' })
          .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
          errorsMessages: expect.arrayContaining([
            expect.objectContaining({ field: 'content' }),
          ]),
        });
      });

      it('❌ should return 400 when content is too long (> 300 chars)', async () => {
        const res = await request(app)
          .put(`${COMMENTS_PATH}/${commentId}`)
          .set('Authorization', `Bearer ${tokenOne}`)
          .send({ content: 'a'.repeat(301) })
          .expect(HttpStatus.BadRequest);

        expect(res.body).toEqual({
          errorsMessages: expect.arrayContaining([
            expect.objectContaining({ field: 'content' }),
          ]),
        });
      });
    });
  });

  describe('DELETE /comments/:id', () => {
    it('❌ should return 401 without JWT', async () => {
      await request(app)
        .delete(`${COMMENTS_PATH}/${commentId}`)
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 403 when trying to delete another user comment', async () => {
      await request(app)
        .delete(`${COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${tokenTwo}`)
        .expect(HttpStatus.Forbidden);
    });

    it('❌ should return 404 for non-existing comment', async () => {
      await request(app)
        .delete(`${COMMENTS_PATH}/000000000000000000000000`)
        .set('Authorization', `Bearer ${tokenOne}`)
        .expect(HttpStatus.NotFound);
    });

    it('✅ should delete own comment and return 404 after', async () => {
      await request(app)
        .delete(`${COMMENTS_PATH}/${commentId}`)
        .set('Authorization', `Bearer ${tokenOne}`)
        .expect(HttpStatus.NoContent);

      await request(app)
        .get(`${COMMENTS_PATH}/${commentId}`)
        .expect(HttpStatus.NotFound);
    });
  });
});
