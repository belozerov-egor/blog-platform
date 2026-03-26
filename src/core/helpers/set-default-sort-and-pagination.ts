import { paginationAndSortingDefault } from '../middlewares/validation/query-pagination-sorting.validation-middleware';
import { QueryOutput } from '../types/paginated.output';

export function setDefaultSortAndPaginationIfNotExist(
  query: Partial<{ pageSize: number; page: number }>,
): Omit<QueryOutput, 'totalCount' | 'pagesCount'> {
  return {
    pageSize: paginationAndSortingDefault.pageSize,
    page: paginationAndSortingDefault.pageNumber,
    ...query,
  };
}
