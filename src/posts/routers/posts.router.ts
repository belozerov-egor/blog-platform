import { Router } from 'express';
import {
  createPostHandler,
  deletePostHandler,
  getPostsHandler,
  getPostsListHandler,
  updateBlogHandler,
} from './handlers';
import { superAdminGuardMiddleware } from '../../core/middlewares/super-admin.guard-middleware';
import {
  idValidation,
  inputValidationResultMiddleware,
  postIdValidation,
} from '../../core/middlewares/validation';
import { postInputDtoValidation } from '../validation/post.input-dto.validation-middlewares';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { PostSortField } from './input/post-sort-field';
import { commentInputDtoValidationMiddlewares } from '../../comments/validation/comment.input.dto.validation-middlewares';
import { jwtAuthGuardMiddleware } from '../../core/middlewares/jwt-auth.guard-middleware';
import { createCommentHandler } from '../../comments/routers/handlers/create-comment-handler';

export const postsRouter = Router({});

postsRouter
  .get(
    '',
    paginationAndSortingValidation(PostSortField),
    inputValidationResultMiddleware,
    getPostsListHandler,
  )
  .get('/:id', idValidation, inputValidationResultMiddleware, getPostsHandler)
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deletePostHandler,
  )
  .post(
    '',
    superAdminGuardMiddleware,
    postInputDtoValidation,
    inputValidationResultMiddleware,
    createPostHandler,
  )
  .put(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    postInputDtoValidation,
    inputValidationResultMiddleware,
    updateBlogHandler,
  )
  .get(
    '/:postId/comments',
    postIdValidation,
    inputValidationResultMiddleware,
    getPostsHandler,
  )
  .post(
    '/:postId/comments',
    jwtAuthGuardMiddleware,
    postIdValidation,
    commentInputDtoValidationMiddlewares,
    inputValidationResultMiddleware,
    createCommentHandler,
  );
