import { Router } from 'express';
import { superAdminGuardMiddleware } from '../../core/middlewares/super-admin.guard-middleware';
import { userInputDtoValidation } from '../validation/user.input-dto.validation-middlewares';
import {
  idValidation,
  inputValidationResultMiddleware,
} from '../../core/middlewares/validation';
import { getUserListHandler } from './handlers/get-user-list-handler';
import { createUserHandler } from './handlers/create-user-handler';
import { deleteUserHandler } from './handlers/delete-user-handler';
import { usersQueryValidation } from '../validation/users-query.validation';

export const usersRouter = Router({});

usersRouter
  .get(
    '',
    superAdminGuardMiddleware,
    usersQueryValidation,
    inputValidationResultMiddleware,
    getUserListHandler,
  )
  .post(
    '',
    superAdminGuardMiddleware,
    userInputDtoValidation,
    inputValidationResultMiddleware,
    createUserHandler,
  )
  .delete(
    '/:id',
    superAdminGuardMiddleware,
    idValidation,
    inputValidationResultMiddleware,
    deleteUserHandler,
  );
