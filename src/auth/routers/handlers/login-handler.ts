import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { authService } from '../../application/auth.service';
import { LoginInput } from '../input/login-input';

export const loginHandler = async (
  req: Request<{}, {}, LoginInput>,
  res: Response,
) => {
  try {
    const { accessToken } = await authService.login(
      req.body.loginOrEmail,
      req.body.password,
    );
    res.send({ accessToken });
  } catch (e) {
    errorsHandler(e, res);
  }
};
