import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { UserSortField } from './user-sort-field';

export type UserQueryInput = PaginationAndSorting<UserSortField> &
  Partial<{ searchEmailTerm: string; searchLoginTerm: string }>;
