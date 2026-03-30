import { Response } from 'express';
import { HttpStatus } from '../types/http-statuses';
import { RepositoryNotFoundError } from './repository-not-found.error';
import { UnauthorizedError } from './unauthorized.error';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  if (error instanceof UnauthorizedError) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  res.sendStatus(HttpStatus.InternalServerError);
}
