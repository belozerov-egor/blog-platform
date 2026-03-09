import { Request, Response } from 'express';
import { BlogInputDto } from '../../dto/blog.input-dto';
import { randomUUID } from 'node:crypto';
import { blogsRepository } from '../../repositories/blogs.repository';
import { HttpStatus } from '../../../core/types/http-statuses';

export const createBlogHandler = (
  req: Request<{}, {}, BlogInputDto>,
  res: Response,
) => {
  const { body } = req;

  const newBlog = {
    id: randomUUID(),
    ...body,
  };
  blogsRepository.create(newBlog);
  res.status(HttpStatus.Created).send(newBlog);
};
