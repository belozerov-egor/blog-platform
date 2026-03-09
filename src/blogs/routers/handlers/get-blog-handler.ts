import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsRepository } from '../../repositories/blogs.repository';

export const getBlogsHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const blog = blogsRepository.findById(id);
  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }
  res.send(blog);
};
