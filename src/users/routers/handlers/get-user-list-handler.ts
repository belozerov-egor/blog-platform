import { Request, Response } from 'express';
import { UserQueryInput } from '../input/user-query-input';
import { matchedData } from 'express-validator';
import { errorsHandler } from '../../../core/errors/errors.handler';
import { usersService } from '../../application/user.service';

export const getUserListHandler = async (req: Request, res: Response) => {
  try {
    const sanitizedQuery = matchedData<UserQueryInput>(req, {
      locations: ['query'],
      includeOptionals: true,
    }); //утилита для извечения трансформированных значений после валидатара
    //в req.query остаются сырые квери параметры (строки)

    const { totalCount, items, pagesCount, page, pageSize } =
      await usersService.findMany(sanitizedQuery);

    res.send({
      page,
      pageSize,
      totalCount,
      pagesCount,
      items,
    });
  } catch (e) {
    errorsHandler(e, res);
  }
};
