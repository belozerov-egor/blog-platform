import { Response } from 'express';
import { HttpStatus } from '../types/http-statuses';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { UnauthorizedError } from './unauthorized.error';
import { ForbiddenError } from './forbidden.error';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  if (error instanceof ForbiddenError) {
    res.sendStatus(HttpStatus.Forbidden);
    return;
  }

  res.sendStatus(HttpStatus.InternalServerError);
}
