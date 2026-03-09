import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';
import { HttpStatus } from '../../../core/types/http-statuses';

export const deletePostHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const postIndex = db.posts.findIndex((post) => post.id === id);
  if (postIndex === -1) {
    res.sendStatus(HttpStatus.NotFound);
  }
  db.posts.splice(postIndex, 1);
  res.sendStatus(HttpStatus.NoContent);
};
