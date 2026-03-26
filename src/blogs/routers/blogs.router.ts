import { Router } from 'express';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogListHandler,
  getBlogsHandler,
  updateBlogHandler,
} from './handlers';
import {
  idValidation,
  inputValidationResultMiddleware,
} from '../../core/middlewares/validation';
import { blogsInputDtoValidation } from '../validation/blogs.input-dto.validation-middlewares';
import { superAdminGuardMiddleware } from '../../core/middlewares/super-admin.guard-middleware';
import { blogsQueryValidation } from '../validation/blogs-query.validation';
import { createPostForBlogHandler } from './handlers/create-post-for-blog-handler';
import { postForBlogInputDtoValidation } from '../../posts/validation/post.input-dto.validation-middlewares';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from '../../posts/routers/input/post-sort-field';
import { getPostListForBlogHandler } from './handlers/get-post-list-for-blog-handler';

export const blogsRouter = Router({});

blogsRouter
  .get(
    '',
    blogsQueryValidation,
    inputValidationResultMiddleware,
    getBlogListHandler,
  )
  .get('/:id', idValidation, inputValidationResultMiddleware, getBlogsHandler)
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteBlogHandler,
  )
  .post(
    '',
    superAdminGuardMiddleware,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    createBlogHandler,
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    blogsInputDtoValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )
  .get(
    '/:id/posts',
    idValidation,
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostListForBlogHandler,
  )
  .post(
    '/:id/posts',
    superAdminGuardMiddleware,
    idValidation,
    postForBlogInputDtoValidation,
    inputValidationResultMiddleware,
    createPostForBlogHandler,
  );
