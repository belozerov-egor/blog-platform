import { Request, Response } from 'express';
import { commentsService } from '../../application/comments.service';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { HttpStatus } from '../../../core/types/http-statuses';

export const deleteCommentHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const { userId } = req.user!;
    await commentsService.deleteComment(id, userId);
    res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    errorsHandler(error, res);
  }
};
