import { Request, Response } from 'express';
import { authService } from '../../application/auth.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const meHandlers = async (req: Request, res: Response) => {
  try {
    const user = await authService.me(req.user!.userId);
    res.send(user);
  } catch (error) {
    errorsHandler(error, res);
  }
};
