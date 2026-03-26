import { paginationAndSortingDefault } from '../middlewares/validation/query-pagination-sorting.validation-middleware';

export const getPagesCount = (
  pageSize: number = paginationAndSortingDefault.pageSize,
  totalCount: number,
): number => {
  return Math.ceil(totalCount / pageSize);
};
