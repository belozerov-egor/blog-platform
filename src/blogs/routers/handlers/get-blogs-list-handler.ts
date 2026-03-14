import { Request, Response } from 'express';
import { blogsRepository } from '../../repositories/blogs.repository';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';
import { HttpStatus } from '../../../core/types/http-statuses';

export async function getBlogsListHandler(req: Request, res: Response) {
  try {
    const blogs = await blogsRepository.findAll();
    const blogsViewModel = blogs.map(mapToBlogViewModel);
    res.send(blogsViewModel);
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
}
