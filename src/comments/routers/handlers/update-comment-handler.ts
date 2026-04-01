import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { commentsService } from '../../application/comments.service';
import { HttpStatus } from '../../../core/types/http-statuses';

export const updateCommentHandler = async (
  req: Request<{ id: string }, { content: string }>,
  res: Response,
) => {
  try {
    const { userId } = req.user!;
    const { id } = req.params;
    const { content } = req.body;
    console.log(id);
    await commentsService.updateComment(id, content, userId);
    res.sendStatus(HttpStatus.NoContent);
  } catch (error) {
    errorsHandler(error, res);
  }
};
