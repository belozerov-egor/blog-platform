import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { blogsRepository } from '../../repositories/blogs.repository';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';

export const getBlogsHandler = async (
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
    const blogViewModel = mapToBlogViewModel(blog);
    res.send(blogViewModel);
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
