import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsRepository } from '../../repositories/posts.repository';

export const deletePostHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const post = postsRepository.findById(id);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
  }
  postsRepository.delete(id);
  res.sendStatus(HttpStatus.NoContent);
};
