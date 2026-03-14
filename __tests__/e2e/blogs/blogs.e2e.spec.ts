import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { BlogInputDto } from '../../../src/blogs/dto/blog.input-dto';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { TESTING_PATH } from '../../../src/core/paths/paths';

describe('Blogs API (e2e)', () => {
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

  const testBlogData: BlogInputDto = {
    name: 'My blog',
    description: 'Some description',
    websiteUrl: 'https://example.com',
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it('✅ should create blog; POST /blogs', async () => {
    const newBlog: BlogInputDto = {
      name: 'Another blog',
      description: 'Another description',
      websiteUrl: 'https://test.example.com/path',
    };

    const createResponse = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send(newBlog)
      .expect(HttpStatus.Created);

    expect(createResponse.body).toEqual({
      ...newBlog,
      id: expect.any(String),
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('✅ should return blogs list; GET /blogs', async () => {
    await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({ ...testBlogData, name: 'Blog 1' })
      .expect(HttpStatus.Created);

    await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({ ...testBlogData, name: 'Blog 2' })
      .expect(HttpStatus.Created);

    const blogsListResponse = await request(app)
      .get('/blogs')
      .expect(HttpStatus.Ok);

    expect(blogsListResponse.body).toBeInstanceOf(Array);
    expect(blogsListResponse.body.length).toBeGreaterThanOrEqual(2);
  });

  it('✅ should return blog by id; GET /blogs/:id', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({ ...testBlogData, name: 'Find me' })
      .expect(HttpStatus.Created);

    const getResponse = await request(app)
      .get(`/blogs/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getResponse.body).toEqual({
      ...createResponse.body,
      id: expect.any(String),
    });
  });

  it('✅ should update blog; PUT /blogs/:id', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({ ...testBlogData, name: 'Before update' })
      .expect(HttpStatus.Created);

    const blogUpdateData: BlogInputDto = {
      name: 'Updated name',
      description: 'Updated description',
      websiteUrl: 'https://updated.example.com/updated',
    };

    await request(app)
      .put(`/blogs/${createResponse.body.id}`)
      .set(correctAuthHeader)
      .send(blogUpdateData)
      .expect(HttpStatus.NoContent);

    const getUpdatedResponse = await request(app)
      .get(`/blogs/${createResponse.body.id}`)
      .expect(HttpStatus.Ok);

    expect(getUpdatedResponse.body).toEqual({
      ...blogUpdateData,
      id: createResponse.body.id,
      createdAt: expect.any(String),
      isMembership: false,
    });
  });

  it('✅ should delete blog; DELETE /blogs/:id and then return NOT FOUND', async () => {
    const createResponse = await request(app)
      .post('/blogs')
      .set(correctAuthHeader)
      .send({ ...testBlogData, name: 'To delete' })
      .expect(HttpStatus.Created);

    await request(app)
      .delete(`/blogs/${createResponse.body.id}`)
      .set(correctAuthHeader)
      .expect(HttpStatus.NoContent);

    await request(app)
      .get(`/blogs/${createResponse.body.id}`)
      .expect(HttpStatus.NotFound);
  });

  it('❌ should reject create blog without authorization; POST /blogs', async () => {
    await request(app)
      .post('/blogs')
      .send(testBlogData)
      .expect(HttpStatus.Unauthorized);
  });
});
