import { Request, Response } from 'express';
import { usersService } from '../../application/user.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { UserAttributes } from '../../application/dtos/user-attributes';
import { HttpStatus } from '../../../core/types/http-statuses';

export const createUserHandler = async (
  req: Request<{}, UserAttributes>,
  res: Response,
) => {
  try {
    const userId = await usersService.create(req.body);
    const user = await usersService.findByIdOrFail(userId);
    res.status(HttpStatus.Created).send(user);
  } catch (e) {
    errorsHandler(e, res);
  }
};
