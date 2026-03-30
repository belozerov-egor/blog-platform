import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { authService } from '../../application/auth.service';
import { LoginInput } from '../input/login-input';

export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  try {
    await authService.login(req.body.loginOrEmail, req.body.password);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e) {
    errorsHandler(e, res);
  }
};
