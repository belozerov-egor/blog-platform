import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsRepository } from '../../repositories/posts.repository';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';

export const getPostsHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const post = await postsRepository.findById(id);
    if (!post) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    res.send(mapToPostViewModel(post));
  } catch {
    res.status(HttpStatus.InternalServerError);
  }
};
