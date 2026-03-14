import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { HttpStatus } from '../../../core/types/http-statuses';

export const updateBlogHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const blog = await blogsRepository.findById(id);
    if (!blog) {
      res.sendStatus(HttpStatus.NotFound);
      return;
    }
    await blogsRepository.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
