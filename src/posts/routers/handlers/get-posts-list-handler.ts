import { Request, Response } from 'express';
import { HttpStatus } from '../../../core/types/http-statuses';
import { mapToPostViewModel } from '../mappers/map-to-post-view-model.util';
import { postsService } from '../../application/posts.service';
import { PostSortField } from '../input/post-sort-field';
import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { matchedData } from 'express-validator';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { getPagesCount } from '../../../core/helpers/get-pages-count';

export const getPostsListHandler = async (
  req: Request<{}, {}, {}, PaginationAndSorting<PostSortField>>,
  res: Response,
) => {
  try {
    const sanitizedQuery = matchedData<PaginationAndSorting<PostSortField>>(
      req,
      {
        locations: ['query'],
        includeOptionals: true,
      },
    ); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const queryInput = setDefaultSortAndPaginationIfNotExist({
      pageSize: sanitizedQuery.pageSize,
      page: sanitizedQuery.pageNumber,
    });
    const { totalCount, items } = await postsService.findMany(sanitizedQuery);
    const posts = items.map(mapToPostViewModel);
    const pagesCount = getPagesCount(queryInput.pageSize, totalCount);
    res.send({
      page: queryInput.page,
      pageSize: queryInput.pageSize,
      totalCount,
      pagesCount,
      items: posts,
    });
  } catch {
    res.sendStatus(HttpStatus.InternalServerError);
  }
};
