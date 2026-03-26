import { Request, Response } from 'express';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const getBlogsHandler = async (
  req: Request<{ id: string }>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const blog = await blogsService.findByIdOrFail(id);
    const blogViewModel = mapToBlogViewModel(blog);
    res.send(blogViewModel);
  } catch (e) {
    errorsHandler(e, res);
  }
};
