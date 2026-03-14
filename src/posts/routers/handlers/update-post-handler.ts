import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { postsRepository } from '../../repositories/posts.repository';
import { PostInputDto } from '../../dto/post.input-dto';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';

export const updateBlogHandler = async (
  req: Request<{ id: string }, {}, PostInputDto>,
  res: Response,
) => {
  try {
    const { id } = req.params;
    const post = await postsRepository.findById(id);
    const blog = await blogsRepository.findById(req.body.blogId);
    if (!blog) {
      return res
        .status(HttpStatus.BadRequest)
        .send({ field: 'blogId', message: 'Blog not found' });
    }
    if (!post) {
      return res.sendStatus(HttpStatus.NotFound);
    }
    await postsRepository.update(id, req.body);
    res.sendStatus(HttpStatus.NoContent);
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
