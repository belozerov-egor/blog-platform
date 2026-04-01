import { body } from 'express-validator';

const content = body('content')
  .isString()
  .withMessage('content should be string')
  .trim()
  .isLength({ min: 20, max: 300 })
  .withMessage('Length of content is not correct');

export const commentInputDtoValidationMiddlewares = [content];
