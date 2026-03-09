import { Request, Response } from 'express';
import { db } from '../../../db/in-memory.db';

export const getPostsListHandler = (req: Request, res: Response) => {
  res.send(db.posts);
};
