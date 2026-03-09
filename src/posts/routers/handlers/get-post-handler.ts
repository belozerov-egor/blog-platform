import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core/types/http-statuses';

export const getPostsHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const post = db.posts.find((post) => post.id === id);
  if (!post) {
    res.sendStatus(HttpStatus.NotFound);
  }
  res.send(post);
};
