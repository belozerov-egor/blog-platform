import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { PostInputDto } from '../../dto/post.input-dto';
import { postsRepository } from '../../repositories/posts.repository';
import { blogsRepository } from '../../../blogs/repositories/blogs.repository';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';

export const createPostHandler = async (
  req: Request<{}, {}, PostInputDto>,
  res: Response,
) => {
  try {
    const { body } = req;
    const blog = await blogsRepository.findById(body.blogId);
    if (!blog) {
      return res
        .status(HttpStatus.BadRequest)
        .send({ field: 'blogId', message: 'Blog not found' });
    }
    const newPost = {
      blogName: blog.name,
      createdAt: new Date(),
      ...body,
    };
    const newCreatedPost = await postsRepository.create(newPost);
    if (!newCreatedPost) {
      return res.sendStatus(HttpStatus.BadRequest);
    }
    res.status(HttpStatus.Created).send(mapToPostViewModel(newCreatedPost));
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
