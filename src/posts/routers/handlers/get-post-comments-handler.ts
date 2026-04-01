import { Request, Response } from 'express';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { PaginationAndSorting } from '../../../core/types/pagination-and-sorting';
import { CommentsSortField } from '../../../comments/routers/input/comments-sort-field';
import { matchedData } from 'express-validator';
import { commentsService } from '../../../comments/application/comments.service';

export const getPostCommentsHandler = async (
  req: Request<
    { postId: string },
    {},
    {},
    PaginationAndSorting<CommentsSortField>
  >,
  res: Response,
) => {
  try {
    const sanitizedQuery = matchedData<PaginationAndSorting<CommentsSortField>>(
      req,
      {
        locations: ['query'],
        includeOptionals: true,
      },
    ); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)
    const { postId } = req.params;
    const result = await commentsService.findManyComments(
      postId,
      sanitizedQuery,
    );
    res.send(result);
  } catch (error) {
    errorsHandler(error, res);
  }
};
