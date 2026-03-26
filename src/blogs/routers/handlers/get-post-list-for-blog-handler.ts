import { Request, Response } from 'express';
import { PostSortField } from '../../../posts/routers/input/post-sort-field';
import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { matchedData } from 'express-validator';
import { setDefaultSortAndPaginationIfNotExist } from '../../../core/helpers/set-default-sort-and-pagination';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { postsService } from '../../../posts/application/posts.service';
import { mapToPostViewModel } from '../../../posts/routers/mappers/map-to-post-view-model.util';
import { getPagesCount } from '../../../core/helpers/get-pages-count';

export const getPostListForBlogHandler = async (
  req: Request<{ id: string }, {}, {}, PaginationAndSorting<PostSortField>>,
  res: Response,
) => {
  try {
    const sanitizedQuery = matchedData<PaginationAndSorting<PostSortField>>(
      req,
      {
        locations: ['query'],
        includeOptionals: true,
      },
    );
    const { page, pageSize } = setDefaultSortAndPaginationIfNotExist({
      pageSize: sanitizedQuery.pageSize,
      page: sanitizedQuery.pageNumber,
    });
    const { items, totalCount } = await postsService.findForBlog(
      req.params.id,
      sanitizedQuery,
    );
    const posts = items.map(mapToPostViewModel);
    const pagesCount = getPagesCount(pageSize, totalCount);
    res.send({
      page,
      pageSize,
      items: posts,
      pagesCount,
      totalCount,
    });
  } catch (error) {
    errorsHandler(error, res);
  }
};
