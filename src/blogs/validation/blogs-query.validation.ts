import { query } from 'express-validator';
import { BlogsSortField } from '../routers/input/blogs-sort-field';
import { paginationAndSortingValidation } from '../../core/middlewares/validation/query-pagination-sorting.validation-middleware';

export const blogsQueryValidation = [
  ...paginationAndSortingValidation(BlogsSortField),
  query('searchNameTerm').optional().isString().trim(),
];
