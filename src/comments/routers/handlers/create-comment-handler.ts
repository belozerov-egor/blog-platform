import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { commentsService } from '../../application/comments.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const createCommentHandler = async (
  req: Request<{ postId: string }, {}, { content: string }>,
  res: Response,
) => {
  try {
    const { postId } = req.params;
    const { content } = req.body;
    if (!req.user) {
      res.sendStatus(HttpStatus.Unauthorized);
      return;
    }
    const { userId, userLogin } = req.user;

    const comment = await commentsService.createComment(postId, content, {
      userId,
      userLogin,
    });

    res.status(HttpStatus.Created).send(comment);
  } catch (e) {
    errorsHandler(e, res);
  }
};
