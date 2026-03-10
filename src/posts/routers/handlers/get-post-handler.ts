import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsRepository } from '../../repositories/posts.repository';

export const getPostsHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const post = postsRepository.findById(id);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
  }
  res.send(post);
};
