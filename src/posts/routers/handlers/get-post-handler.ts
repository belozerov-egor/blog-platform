import { Request, Response } from 'express';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';
import { postsService } from '../../application/posts.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const getPostsHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const post = await postsService.findByIdOrFail(id);
    res.send(mapToPostViewModel(post));
  } catch (e) {
    errorsHandler(e, res);
  }
};
