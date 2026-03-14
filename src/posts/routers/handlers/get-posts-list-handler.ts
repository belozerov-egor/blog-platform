import { Request, Response } from 'express';
import { postsRepository } from '../../repositories/posts.repository';
import { HttpStatus } from '../../../core/types/http-statuses';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';

export const getPostsListHandler = async (req: Request, res: Response) => {
  try {
    const posts = await postsRepository.findAll();
    res.send(posts.map(mapToPostViewModel));
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
