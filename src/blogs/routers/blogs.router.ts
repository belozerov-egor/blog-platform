import { Router } from 'express';
import {
  createBlogHandler,
  deleteBlogHandler,
  getBlogsHandler,
  getBlogsListHandler,
  updateBlogHandler,
} from './handlers';
import {
  idValidation,
  inputValidationResultMiddleware,
} from '../../core/middlewares/validation';
import { blogsInputDtoValidation } from '../validation/blogs.input-dto.validation-middlewares';
import { superAdminGuardMiddleware } from '../../core/middlewares/super-admin.guard-middleware';

export const blogsRouter = Router({});

blogsRouter
  .get('', getBlogsListHandler)
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
  );
