import { Request, Response } from 'express';
import { PostForBlogAttributes } from '../../application/dtos/post-for-blog-attributes';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { blogsService } from '../../application/blogs.service';
import { postsService } from '../../../posts/application/posts.service';
import { HttpStatus } from '../../../core/types/http-statuses';
import { mapToPostViewModel } from '../../../posts/routers/mappers/map-to-post-view-model.util';

export const createPostForBlogHandler = async (
  req: Request<{ id: string }, {}, PostForBlogAttributes>,
  res: Response,
) => {
  try {
    const id = req.params.id;
    const body = req.body;
    const postId = await blogsService.createPost(id, body);
    const post = await postsService.findByIdOrFail(postId);
    res.status(HttpStatus.Created).send(mapToPostViewModel(post));
  } catch (error) {
    errorsHandler(error, res);
  }
};
