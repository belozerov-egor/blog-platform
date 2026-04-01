import { Router } from 'express';
import { deleteCommentHandler } from './handlers/delete-comment-handler';
import {
  idValidation,
  inputValidationResultMiddleware,
} from '../../core/middlewares/validation';
import { jwtAuthGuardMiddleware } from '../../core/middlewares/jwt-auth.guard-middleware';
import { getCommentHandler } from './handlers/get-comment-handler';
import { updateCommentHandler } from './handlers/update-comment-handler';
import { commentInputDtoValidationMiddlewares } from '../validation/comment.input.dto.validation-middlewares';

export const commentsRouter = Router({});

commentsRouter
  .get('/:id', idValidation, inputValidationResultMiddleware, getCommentHandler)
  .delete(
    '/:id',
    idValidation,
    jwtAuthGuardMiddleware,
    inputValidationResultMiddleware,
    deleteCommentHandler,
  )
  .put(
    '/:id',
    idValidation,
    jwtAuthGuardMiddleware,
    commentInputDtoValidationMiddlewares,
    inputValidationResultMiddleware,
    updateCommentHandler,
  );
