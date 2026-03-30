import { body } from 'express-validator';

export const loginInputValidation = [
  body('loginOrEmail')
    .isString()
    .withMessage('loginOrEmail should be a string')
    .trim()
    .notEmpty()
    .withMessage('loginOrEmail is required'),

  body('password')
    .isString()
    .withMessage('password should be a string')
    .trim()
    .notEmpty()
    .withMessage('password is required'),
];
