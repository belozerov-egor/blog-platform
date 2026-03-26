import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';
import { PostAttributes } from '../../application/dtos/post-attributes';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const createPostHandler = async (
  req: Request<{}, {}, PostAttributes>,
  res: Response,
) => {
  try {
    const { body } = req;
    const postId = await postsService.create(body);
    const post = await postsService.findByIdOrFail(postId);
    res.status(HttpStatus.Created).send(mapToPostViewModel(post));
  } catch (e) {
    errorsHandler(e, res);
  }
};
