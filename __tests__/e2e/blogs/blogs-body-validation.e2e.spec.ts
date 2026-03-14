import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { BlogInputDto } from '../../../src/blogs/dto/blog.input-dto';
import { BLOGS_PATH, TESTING_PATH } from '../../../src/core/paths/paths';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';

describe('Blogs API body & id validation (e2e)', () => {
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

  const correctBlogData: BlogInputDto = {
    name: 'My blog',
    description: 'Some description',
    websiteUrl: 'https://example.com',
  };

  beforeAll(async () => {
    await request(app)
      .delete(`${TESTING_PATH}/all-data`)
      .expect(HttpStatus.NoContent);
  });

  it(`❌ should not create blog when incorrect body passed; POST ${BLOGS_PATH}`, async () => {
    const res = await request(app)
      .post(BLOGS_PATH)
      .set(getBasicAuthHeader())
      .send({
        name: '   ',
        description: '   ',
        websiteUrl: 'http://example.com',
      })
      .expect(HttpStatus.BadRequest);

    expect(res.body).toEqual({
      errorsMessages: expect.any(Array),
    });

    // onlyFirstError: true => по одному сообщению на поле
    expect(res.body.errorsMessages).toHaveLength(3);

    const fields = res.body.errorsMessages.map((e: any) => e.field).sort();
    expect(fields).toEqual(['description', 'name', 'websiteUrl']);

    // check что никто не создался
    const list = await request(app).get(BLOGS_PATH).expect(HttpStatus.Ok);
    expect(list.body).toHaveLength(0);
  });

  it(`❌ should not create blog when websiteUrl has query/fragment; POST ${BLOGS_PATH}`, async () => {
    const res = await request(app)
      .post(BLOGS_PATH)
      .set(getBasicAuthHeader())
      .send({
        ...correctBlogData,
        websiteUrl: 'https://example.com/path?a=1#hash',
      })
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages).toHaveLength(1);
    expect(res.body.errorsMessages[0]).toEqual({
      field: 'websiteUrl',
      message: expect.any(String),
    });

    const list = await request(app).get(BLOGS_PATH).expect(HttpStatus.Ok);
    expect(list.body).toHaveLength(0);
  });

  it(`❌ should not update blog when incorrect body passed; PUT ${BLOGS_PATH}/:id`, async () => {
    const create = await request(app)
      .post(BLOGS_PATH)
      .set(getBasicAuthHeader())
      .send({ ...correctBlogData, name: 'Before update' })
      .expect(HttpStatus.Created);

    const blogId: string = create.body.id;

    await request(app)
      .put(`${BLOGS_PATH}/${blogId}`)
      .set(getBasicAuthHeader())
      .send({
        name: '   ',
        description: '   ',
        websiteUrl: 'http://example.com',
      })
      .expect(HttpStatus.BadRequest);

    // убедимся, что данные не поменялись
    const getAfter = await request(app)
      .get(`${BLOGS_PATH}/${blogId}`)
      .expect(HttpStatus.Ok);

    expect(getAfter.body).toEqual({
      ...create.body,
      id: blogId,
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; GET ${BLOGS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   '); // "%20%20%20"

    const res = await request(app)
      .get(`${BLOGS_PATH}/${whitespaceId}`)
      .expect(HttpStatus.BadRequest);

    expect(res.body).toEqual({
      errorsMessages: expect.any(Array),
    });

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; PUT ${BLOGS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   ');

    const res = await request(app)
      .put(`${BLOGS_PATH}/${whitespaceId}`)
      .set(getBasicAuthHeader())
      .send(correctBlogData)
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });

  it(`❌ should return 400 when id is empty/whitespace; DELETE ${BLOGS_PATH}/:id`, async () => {
    const whitespaceId = encodeURIComponent('   ');

    const res = await request(app)
      .delete(`${BLOGS_PATH}/${whitespaceId}`)
      .set(getBasicAuthHeader())
      .expect(HttpStatus.BadRequest);

    expect(res.body.errorsMessages[0]).toEqual({
      field: 'id',
      message: expect.any(String),
    });
  });
});
