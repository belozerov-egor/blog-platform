import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { PostAttributes } from '../../application/dtos/post-attributes';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const updateBlogHandler = async (
  req: Request<{ id: string }, {}, PostAttributes>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    await postsService.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  } catch (e) {
    errorsHandler(e, res);
  }
};
