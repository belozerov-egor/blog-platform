import { Request, Response } from 'express';
import { mapToBlogViewModel } from '../mappers/map-to-blog-view-model.util';
import { BlogsQueryInput } from '../input/blogs-query.input';
import { matchedData } from 'express-validator';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { getPagesCount } from '../../../core/helpers/get-pages-count';
import { blogsService } from '../../application/blogs.service';
import { errorsHandler } from '../../../core/errors/errors.handler';

export async function getBlogListHandler(
  req: Request<{}, {}, {}, BlogsQueryInput>,
  res: Response,
) {
  try {
    const sanitizedQuery = matchedData<BlogsQueryInput>(req, {
      locations: ['query'],
      includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const queryInput = setDefaultSortAndPaginationIfNotExist({
      pageSize: sanitizedQuery.pageSize,
      page: sanitizedQuery.pageNumber,
    });

    const { totalCount, items } = await blogsService.findMany(sanitizedQuery);
    const blogsViewModel = items.map(mapToBlogViewModel);
    const pagesCount = getPagesCount(queryInput.pageSize, totalCount);

    res.send({
      page: queryInput.page,
      pageSize: queryInput.pageSize,
      totalCount,
      pagesCount,
      items: blogsViewModel,
    });
  } catch (e) {
    errorsHandler(e, res);
  }
}
