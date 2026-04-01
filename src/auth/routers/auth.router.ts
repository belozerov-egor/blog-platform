import { Router } from 'express';
import { loginInputValidation } from '../validation/login-input.validation';
import { inputValidationResultMiddleware } from '../../core/middlewares/validation';
import { loginHandler } from './handlers/login-handler';
import { jwtAuthGuardMiddleware } from '../../core/middlewares/jwt-auth.guard-middleware';
import { meHandlers } from './handlers/me-handler';

export const authRouter = Router({});

authRouter
  .post(
    '/login',
    loginInputValidation,
    inputValidationResultMiddleware,
    loginHandler,
  )
  .get(
    '/me',
    jwtAuthGuardMiddleware,
    inputValidationResultMiddleware,
    meHandlers,
  );
