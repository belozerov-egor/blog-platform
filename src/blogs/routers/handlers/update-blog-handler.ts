import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { HttpStatus } from '../../../core/types/http-statuses';

export const updateBlogHandler = (
  req: Request<{ id: string }>,
  res: Response,
) => {
  const { id } = req.params;
  const blog = blogsRepository.findById(id);
  if (!blog) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }
  blogsRepository.update(id, req.body);
  res.sendStatus(HttpStatus.NoContent);
};
