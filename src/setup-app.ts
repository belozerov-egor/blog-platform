import express, { Express } from 'express';
import {
  AUTH_PATH,
  BLOGS_PATH,
  POSTS_PATH,
  TESTING_PATH,
  USERS_PATH,
} from './core/paths/paths';
import { blogsRouter } from './blogs/routers/blogs.router';
import { postsRouter } from './posts/routers/posts.router';
import { testingRouter } from './testing/routers/testing.router';
import { usersRouter } from './users/routers/users.router';
import { authRouter } from './auth/routers/auth.router';

export const setupApp = (app: Express) => {
  app.use(express.json());

  app.get('/', (req, res) => {
    res.status(200).send('Hello world!');
  });
  app.use(BLOGS_PATH, blogsRouter);
  app.use(POSTS_PATH, postsRouter);
  app.use(USERS_PATH, usersRouter);
  app.use(AUTH_PATH, authRouter);
  app.use(TESTING_PATH, testingRouter);
  return app;
};
