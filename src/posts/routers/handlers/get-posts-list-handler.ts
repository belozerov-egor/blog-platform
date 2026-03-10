import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';

export const getPostsListHandler = (req: Request, res: Response) => {
  res.send(postsRepository.findAll());
};
