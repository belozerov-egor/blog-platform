import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { PostInputDto } from '../../../src/posts/dto/post.input-dto';
import {
  POSTS_PATH,
  BLOGS_PATH,
  TESTING_PATH,
} from '../../../src/core/paths/paths';

describe('Posts API body & id validation (e2e)', () => {
  const app = express();
  setupApp(app);

  const getBasicAuthHeader = () => {
    const username = process.env.ADMIN_USERNAME;
    const password = process.env.ADMIN_PASSWORD;

    if (!username || !password) {
      throw new Error(
        'Set ADMIN_USERNAME and ADMIN_PASSWORD env vars for e2e tests',
      );
    }

    const token = Buffer.from(`${username}:${password}`).toString('base64');
    return { Authorization: `Basic ${token}` };
  };

  let blogId: string;

  const correctPostData = (): PostInputDto => ({
    title: 'My post',
    shortDescription: 'Some description',
    content: 'Some content',
    blogId,
  });

  beforeAll(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);

    const blogResponse = await request(app)
      .post(BLOGS_PATH)
      .set(getBasicAuthHeader())
      .send({
        name: 'Test blog',
        description: 'Test blog description',
        websiteUrl: 'https://example.com',
      })
      .expect(HttpStatus.Created);

    blogId = blogResponse.body.id;
  });

  it(`❌ should not create post when incorrect body passed; POST ${POSTS_PATH}`, async () => {
    const res = await request(app)
      .post(POSTS_PATH)
      .set(getBasicAuthHeader())
      .send({
        title: '   ',
        shortDescription: '   ',
        content: '   ',
        blogId: '   ',
      })
      .expect(HttpStatus.BadRequest);

    expect(res.body).toEqual({
      errorsMessages: expect.any(Array),
    });

    expect(res.body.errorsMessages).toHaveLength(4);

    const fields = res.body.errorsMessages.map((e: any) => e.field).sort();
    expect(fields).toEqual(['blogId', 'content', 'shortDescription', 'title']);

    const list = await request(app).get(POSTS_PATH).expect(HttpStatus.Ok);
    expect(list.body).toHaveLength(0);
  });

  it(`❌ should not create post when blogId does not exist; POST ${POSTS_PATH}`, async () => {
    const res = await request(app)
      .post(POSTS_PATH)
      .set(getBasicAuthHeader())
      .send({
        ...correctPostData(),
        blogId: 'nonexistent-id',
      })
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages).toHaveLength(1);
    expect(res.body.errorsMessages[0]).toEqual({
      field: 'blogId',
      message: expect.any(String),
    });

    const list = await request(app).get(POSTS_PATH).expect(HttpStatus.Ok);
    expect(list.body).toHaveLength(0);
  });

  it(`❌ should not update post when incorrect body passed; PUT ${POSTS_PATH}/:id`, async () => {
    const create = await request(app)
      .post(POSTS_PATH)
      .set(getBasicAuthHeader())
      .send({ ...correctPostData(), title: 'Before update' })
      .expect(HttpStatus.Created);

    const postId: string = create.body.id;

    await request(app)
      .put(`${POSTS_PATH}/${postId}`)
      .set(getBasicAuthHeader())
      .send({
        title: '   ',
        shortDescription: '   ',
        content: '   ',
        blogId: '   ',
      })
      .expect(HttpStatus.BadRequest);

    const getAfter = await request(app)
      .get(`${POSTS_PATH}/${postId}`)
      .expect(HttpStatus.Ok);

    expect(getAfter.body).toEqual({
      ...create.body,
      id: postId,
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; GET ${POSTS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   ');

    const res = await request(app)
      .get(`${POSTS_PATH}/${whitespaceId}`)
      .expect(HttpStatus.BadRequest);

    expect(res.body).toEqual({
      errorsMessages: expect.any(Array),
    });

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; PUT ${POSTS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   ');

    const res = await request(app)
      .put(`${POSTS_PATH}/${whitespaceId}`)
      .set(getBasicAuthHeader())
      .send(correctPostData())
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; DELETE ${POSTS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   ');

    const res = await request(app)
      .delete(`${POSTS_PATH}/${whitespaceId}`)
      .set(getBasicAuthHeader())
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });
});
