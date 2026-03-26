import request from 'supertest';
import express from 'express';
import { setupApp } from '../../../src/setup-app';
import { HttpStatus } from '../../../src/core/types/http-statuses';
import { client, runDB } from '../../../src/db/mongo.db';
import { SETTINGS } from '../../../src/core/settings/settings';
import { TESTING_PATH } from '../../../src/core/paths/paths';
import { BlogAttributes } from '../../../src/blogs/application/dtos/blog-attributes';

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

  const testBlogData: BlogAttributes = {
    name: 'My blog',
    description: 'Some description',
    websiteUrl: 'https://example.com',
  };

  beforeAll(async () => {
    await request(app).delete('/testing/all-data').expect(HttpStatus.NoContent);
  });

  it('✅ should create blog; POST /blogs', async () => {
    const newBlog: BlogAttributes = {
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

    expect(blogsListResponse.body).toEqual({
      pagesCount: expect.any(Number),
      page: expect.any(Number),
      pageSize: expect.any(Number),
      totalCount: expect.any(Number),
      items: expect.arrayContaining([
        expect.objectContaining({ name: 'Blog 1' }),
        expect.objectContaining({ name: 'Blog 2' }),
      ]),
    });
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

    const blogUpdateData: BlogAttributes = {
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

  describe('POST /blogs/:id/posts', () => {
    let blogId: string;

    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      const blogResponse = await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send(testBlogData)
        .expect(HttpStatus.Created);

      blogId = blogResponse.body.id;
    });

    it('✅ should create post for blog', async () => {
      const res = await request(app)
        .post(`/blogs/${blogId}/posts`)
        .set(correctAuthHeader)
        .send({
          title: 'Post for blog',
          shortDescription: 'Some description',
          content: 'Some content',
        })
        .expect(HttpStatus.Created);

      expect(res.body).toEqual({
        id: expect.any(String),
        title: 'Post for blog',
        shortDescription: 'Some description',
        content: 'Some content',
        blogId,
        blogName: testBlogData.name,
        createdAt: expect.any(String),
      });
    });

    it('❌ should return 404 for non-existing blog', async () => {
      await request(app)
        .post('/blogs/000000000000000000000000/posts')
        .set(correctAuthHeader)
        .send({
          title: 'Post for blog',
          shortDescription: 'Some description',
          content: 'Some content',
        })
        .expect(HttpStatus.NotFound);
    });

    it('❌ should return 401 without authorization', async () => {
      await request(app)
        .post(`/blogs/${blogId}/posts`)
        .send({
          title: 'Post for blog',
          shortDescription: 'Some description',
          content: 'Some content',
        })
        .expect(HttpStatus.Unauthorized);
    });

    it('❌ should return 400 with invalid body', async () => {
      const res = await request(app)
        .post(`/blogs/${blogId}/posts`)
        .set(correctAuthHeader)
        .send({ title: '', shortDescription: '', content: '' })
        .expect(HttpStatus.BadRequest);

      expect(res.body).toEqual({
        errorsMessages: expect.arrayContaining([
          expect.objectContaining({ field: expect.any(String) }),
        ]),
      });
    });
  });

  describe('GET /blogs/:id/posts', () => {
    let blogId: string;
    let otherBlogId: string;

    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      const blogRes = await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send(testBlogData)
        .expect(HttpStatus.Created);
      blogId = blogRes.body.id;

      const otherBlogRes = await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({ ...testBlogData, name: 'Other blog' })
        .expect(HttpStatus.Created);
      otherBlogId = otherBlogRes.body.id;

      // 3 поста для основного блога
      for (let i = 1; i <= 3; i++) {
        await request(app)
          .post(`/blogs/${blogId}/posts`)
          .set(correctAuthHeader)
          .send({
            title: `Post ${i}`,
            shortDescription: 'desc',
            content: 'content',
          })
          .expect(HttpStatus.Created);
      }

      // 1 пост для другого блога (не должен попасть в выдачу)
      await request(app)
        .post(`/blogs/${otherBlogId}/posts`)
        .set(correctAuthHeader)
        .send({
          title: 'Other blog post',
          shortDescription: 'desc',
          content: 'content',
        })
        .expect(HttpStatus.Created);
    });

    it('✅ should return only posts for the specified blog', async () => {
      const res = await request(app)
        .get(`/blogs/${blogId}/posts`)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(3);
      expect(res.body.items).toHaveLength(3);
      res.body.items.forEach((post: any) => {
        expect(post.blogId).toBe(blogId);
      });
    });

    it('✅ should not return posts from other blogs', async () => {
      const res = await request(app)
        .get(`/blogs/${otherBlogId}/posts`)
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(1);
      expect(res.body.items[0].title).toBe('Other blog post');
    });

    it('✅ should support pagination', async () => {
      const res = await request(app)
        .get(`/blogs/${blogId}/posts?pageSize=2&pageNumber=2`)
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(2);
      expect(res.body.items).toHaveLength(1);
    });

    it('✅ should sort by createdAt desc by default', async () => {
      const res = await request(app)
        .get(`/blogs/${blogId}/posts`)
        .expect(HttpStatus.Ok);

      const dates = res.body.items.map((i: any) =>
        new Date(i.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });
  });

  describe('GET /blogs — pagination', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      for (let i = 1; i <= 5; i++) {
        await request(app)
          .post('/blogs')
          .set(correctAuthHeader)
          .send({ ...testBlogData, name: `Blog ${i}` })
          .expect(HttpStatus.Created);
      }
    });

    it('✅ should return correct pagesCount and totalCount', async () => {
      const res = await request(app)
        .get('/blogs?pageSize=2')
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(5);
      expect(res.body.pageSize).toBe(2);
      expect(res.body.pagesCount).toBe(3);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return second page', async () => {
      const res = await request(app)
        .get('/blogs?pageSize=2&pageNumber=2')
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(2);
      expect(res.body.items).toHaveLength(2);
    });

    it('✅ should return last page with remaining items', async () => {
      const res = await request(app)
        .get('/blogs?pageSize=2&pageNumber=3')
        .expect(HttpStatus.Ok);

      expect(res.body.page).toBe(3);
      expect(res.body.items).toHaveLength(1);
    });

    it('✅ should return empty items for page beyond range', async () => {
      const res = await request(app)
        .get('/blogs?pageSize=2&pageNumber=99')
        .expect(HttpStatus.Ok);

      expect(res.body.items).toHaveLength(0);
    });
  });

  describe('GET /blogs — search and sorting', () => {
    beforeAll(async () => {
      await request(app)
        .delete(`${TESTING_PATH}/all-data`)
        .expect(HttpStatus.NoContent);

      await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({ ...testBlogData, name: 'Alpha blog' })
        .expect(HttpStatus.Created);

      await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({ ...testBlogData, name: 'Beta blog' })
        .expect(HttpStatus.Created);

      await request(app)
        .post('/blogs')
        .set(correctAuthHeader)
        .send({ ...testBlogData, name: 'Gamma post' })
        .expect(HttpStatus.Created);
    });

    it('✅ should find blogs by searchNameTerm', async () => {
      const res = await request(app)
        .get('/blogs?searchNameTerm=blog')
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(2);
      expect(res.body.items).toHaveLength(2);
      res.body.items.forEach((item: any) => {
        expect(item.name.toLowerCase()).toContain('blog');
      });
    });

    it('✅ should return empty items when searchNameTerm has no matches', async () => {
      const res = await request(app)
        .get('/blogs?searchNameTerm=zzznomatch')
        .expect(HttpStatus.Ok);

      expect(res.body.totalCount).toBe(0);
      expect(res.body.items).toHaveLength(0);
    });

    it('✅ should sort by name asc', async () => {
      const res = await request(app)
        .get('/blogs?sortBy=name&sortDirection=asc')
        .expect(HttpStatus.Ok);

      const names = res.body.items.map((i: any) => i.name);
      expect(names).toEqual([...names].sort());
    });

    it('✅ should sort by name desc', async () => {
      const res = await request(app)
        .get('/blogs?sortBy=name&sortDirection=desc')
        .expect(HttpStatus.Ok);

      const names = res.body.items.map((i: any) => i.name);
      expect(names).toEqual([...names].sort().reverse());
    });

    it('✅ should sort by createdAt desc by default', async () => {
      const res = await request(app).get('/blogs').expect(HttpStatus.Ok);

      const dates = res.body.items.map((i: any) =>
        new Date(i.createdAt).getTime(),
      );
      for (let i = 0; i < dates.length - 1; i++) {
        expect(dates[i]).toBeGreaterThanOrEqual(dates[i + 1]);
      }
    });

    it('✅ should sort by createdAt asc', async () => {
      const res = await request(app)
        .get('/blogs?sortBy=createdAt&sortDirection=asc')
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
