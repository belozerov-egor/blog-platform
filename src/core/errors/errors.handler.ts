import { Response } from 'express';
import { HttpStatus } from '../types/http-statuses';
import { RepositoryNotFoundError } from './repository-not-found.error';

export function errorsHandler(error: unknown, res: Response): void {
  if (error instanceof RepositoryNotFoundError) {
    res.sendStatus(HttpStatus.NotFound);
    return;
  }

  res.sendStatus(HttpStatus.InternalServerError);
}
