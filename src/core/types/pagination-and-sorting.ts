import { SortDirection } from './sort-direction';

export type PaginationAndSorting<T> = {
  pageNumber: number;
  pageSize: number;
  sortBy: T;
  sortDirection: SortDirection;
};
