import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { BlogsSortField } from './blogs-sort-field';

export type BlogsQueryInput = PaginationAndSorting<BlogsSortField> &
  Partial<{
    searchNameTerm: string;
  }>;
