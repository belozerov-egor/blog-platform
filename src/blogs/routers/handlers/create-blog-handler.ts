import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';
import { BlogAttributes } from '../../application/dtos/blog-attributes';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export const createBlogHandler = async (
  req: Request<{}, {}, BlogAttributes>,
  res: Response,
) => {
  try {
    const { body } = req;

    const blogId = await blogsService.create(body);
    const blog = await blogsService.findByIdOrFail(blogId);
    if (!blog) {
      return res.sendStatus(HttpStatus.BadRequest);
    }
    res.status(HttpStatus.Created).send(mapToBlogViewModel(blog));
  } catch (e) {
    errorsHandler(e, res);
  }
};
