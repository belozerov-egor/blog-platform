import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsRepository } from '../../repositories/posts.repository';
import { PostInputDto } from '../../dto/post.input-dto';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';

export const updateBlogHandler = (
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) => {
  const { id } = req.params;
  const post = postsRepository.findById(id);
  const blog = blogsRepository.findById(req.body.blogId);
  if (!blog) {
    return res
      .status(HttpStatus.BadRequest)
      .send({ field: 'blogId', message: 'Blog not found' });
  }
  if (!post) {
    return res.sendStatus(HttpStatus.NotFound);
  }
  postsRepository.update(id, req.body);
  res.sendStatus(HttpStatus.NoContent);
};
