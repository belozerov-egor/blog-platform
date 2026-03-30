import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';
import { UserSortField } from '../routers/input/user-sort-field';
import { query } from 'express-validator';

export const usersQueryValidation = [
  ...paginationAndSortingValidation(UserSortField),
  query('searchLoginTerm').optional().isString().trim(),
  query('searchEmailTerm').optional().isString().trim(),
];
