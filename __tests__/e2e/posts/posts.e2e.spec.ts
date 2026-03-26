import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { TESTING_PATH } from '../../../src/core/paths/paths';
import { PostAttributes } from '../../../src/posts/application/dtos/post-attributes';

describe('Posts API (e2e)', () => {
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

  let blogId: string;

  const testPostData = (): PostAttributes => ({
    title: 'My post',
    shortDescription: 'Some description',
    content: 'Some content',
    blogId,
  });

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);

    const blogResponse = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({
        name: 'Test blog',
        description: 'Test blog description',
        websiteUrl: 'https://example.com',
      })
      .expect(HttpStatus.Created);

    blogId = blogResponse.body.id;
  });

  it('✅ should create post; POST /posts', async () => {
    const newPost: PostAttributes = {
      title: 'Another post',
      shortDescription: 'Another description',
      content: 'Another content',
      blogId,
    };

    const createResponse = await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send(newPost)
      .expect(HttpStatus.Created);

    expect(createResponse.body).toEqual({
      ...newPost,
      id: expect.any(String),
      blogName: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('✅ should return posts list; GET /posts', async () => {
    await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({ ...testPostData(), title: 'Post 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({ ...testPostData(), title: 'Post 2' })
      .expect(HttpStatus.Created);

    const postsListResponse = await request(app)
      .get('/posts')
      .expect(HttpStatus.Ok);

    expect(postsListResponse.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayContaining([
        expect.objectContaining({ title: 'Post 1' }),
        expect.objectContaining({ title: 'Post 2' }),
      ]),
    });
  });

  it('✅ should return post by id; GET /posts/:id', async () => {
    const createResponse = await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({ ...testPostData(), title: 'Find me' })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`/posts/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(String),
    });
  });

  it('✅ should update post; PUT /posts/:id', async () => {
    const createResponse = await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({ ...testPostData(), title: 'Before update' })
      .expect(HttpStatus.Created);

    const postUpdateData: PostAttributes = {
      title: 'Updated title',
      shortDescription: 'Updated description',
      content: 'Updated content',
      blogId,
    };

    await request(app)
      .put(`/posts/${createResponse.body.id}`)
      .set(correctAuthHeader)
      .send(postUpdateData)
      .expect(HttpStatus.NoContent);

    const getUpdatedResponse = await request(app)
      .get(`/posts/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getUpdatedResponse.body).toEqual({
      ...postUpdateData,
      id: createResponse.body.id,
      blogName: expect.any(String),
      createdAt: expect.any(String),
    });
  });

  it('✅ should delete post; DELETE /posts/:id and then return NOT FOUND', async () => {
    const createResponse = await request(app)
      .post('/posts')
      .set(correctAuthHeader)
      .send({ ...testPostData(), title: 'To delete' })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`/posts/${createResponse.body.id}`)
      .set(correctAuthHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/posts/${createResponse.body.id}`)
      .expect(HttpStatus.NotFound);
  });

  it('❌ should reject create post without authorization; POST /posts', async () => {
    await request(app)
      .post('/posts')
      .send(testPostData())
      .expect(HttpStatus.Unauthorized);
  });

  describe('GET /posts — pagination', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      const blogResponse = await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({
          name: 'Pagination blog',
          description: 'desc',
          websiteUrl: 'https://example.com',
        })
        .expect(HttpStatus.Created);

      blogId = blogResponse.body.id;

      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/posts')
          .set(correctAuthHeader)
          .send({ ...testPostData(), title: `Post ${i}` })
          .expect(HttpStatus.Created);
      }
    });

    it('✅ should return correct pagesCount and totalCount', async () => {
      const res = await request(app)
        .get('/posts?pageSize=2')
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(5);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.pagesCount).toBe(3);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return second page', async () => {
      const res = await request(app)
        .get('/posts?pageSize=2&pageNumber=2')
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(2);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return last page with remaining items', async () => {
      const res = await request(app)
        .get('/posts?pageSize=2&pageNumber=3')
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(3);
      expect(res.body.items).toHaveLength(1);
    });

    it('✅ should return empty items for page beyond range', async () => {
      const res = await request(app)
        .get('/posts?pageSize=2&pageNumber=99')
        .expect(HttpStatus.Ok);

      expect(res.body.items).toHaveLength(0);
    });
  });

  describe('GET /posts — sorting', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      const blogResponse = await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({
          name: 'Sort blog',
          description: 'desc',
          websiteUrl: 'https://example.com',
        })
        .expect(HttpStatus.Created);

      blogId = blogResponse.body.id;

      await request(app)
        .post('/posts')
        .set(correctAuthHeader)
        .send({ ...testPostData(), title: 'First post' })
        .expect(HttpStatus.Created);

      await request(app)
        .post('/posts')
        .set(correctAuthHeader)
        .send({ ...testPostData(), title: 'Second post' })
        .expect(HttpStatus.Created);

      await request(app)
        .post('/posts')
        .set(correctAuthHeader)
        .send({ ...testPostData(), title: 'Third post' })
        .expect(HttpStatus.Created);
    });

    it('✅ should sort by createdAt desc by default', async () => {
      const res = await request(app).get('/posts').expect(HttpStatus.Ok);

      const dates = res.body.items.map((i: any) =>
        new Date(i.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('✅ should sort by createdAt asc', async () => {
      const res = await request(app)
        .get('/posts?sortBy=createdAt&sortDirection=asc')
        .expect(HttpStatus.Ok);

      const dates = res.body.items.map((i: any) =>
        new Date(i.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeLessThanOrEqual(dates[i + 1]);
      }
    });
  });
});
