import { Request, Response } from 'express';
import { randomUUID } from 'node:crypto';
import { HttpStatus } from '../../../core/types/http-statuses';
import { PostInputDto } from '../../dto/post.input-dto';
import { postsRepository } from '../../repositories/posts.repository';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';

export const createPostHandler = (
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) => {
  const { body } = req;
  const blog = blogsRepository.findById(body.blogId);
  if (!blog) {
    return res
      .status(HttpStatus.BadRequest)
      .send({ field: 'blogId', message: 'Blog not found' });
  }
  const newPost = {
    id: randomUUID(),
    blogName: blog.name,
    ...body,
  };
  postsRepository.create(newPost);
  res.status(HttpStatus.Created).send(newPost);
};
