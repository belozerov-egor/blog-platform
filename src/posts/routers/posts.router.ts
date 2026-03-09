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
} from '../../core/middlewares/validation';
import { postInputDtoValidation } from '../validation/post.input-dto.validation-middlewares';

export const postsRouter = Router({});

postsRouter
  .get('', getPostsListHandler)
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
  );
