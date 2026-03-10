import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { PostInputDto } from '../../../src/posts/dto/post.input-dto';

describe('Posts API (e2e)', () => {
  const app = express();
  setupApp(app);

  const correctAuthHeader = {
    Authorization: `Basic ${Buffer.from(
      `${process.env.ADMIN_USERNAME}:${process.env.ADMIN_PASSWORD}`,
    ).toString('base64')}`,
  };

  let blogId: string;

  const testPostData = (): PostInputDto => ({
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
    const newPost: PostInputDto = {
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

    expect(postsListResponse.body).toBeInstanceOf(Array);
    expect(postsListResponse.body.length).toBeGreaterThanOrEqual(2);
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

    const postUpdateData: PostInputDto = {
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
});
