import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { blogsRepository } from '../../repositories/blogs.repository';
import { HttpStatus } from '../../../core/types/http-statuses';
import { Blog } from '../../types/blogs';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';

export const createBlogHandler = async (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  try {
    const { body } = req;
    const newBlog: Blog = {
      createdAt: new Date(),
      isMembership: false,
      ...body,
    };

    const blog = await blogsRepository.create(newBlog);
    if (!blog) {
      return res.sendStatus(HttpStatus.BadRequest);
    }
    res.status(HttpStatus.Created).send(mapToBlogViewModel(blog));
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
