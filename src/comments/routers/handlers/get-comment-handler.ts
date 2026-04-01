import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { commentsService } from '../../application/comments.service';

export const getCommentHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const comment = await commentsService.findByIdOrFail(id);
    res.send(comment);
  } catch (error) {
    errorsHandler(error, res);
  }
};
