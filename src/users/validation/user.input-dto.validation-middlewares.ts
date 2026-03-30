import { body } from 'express-validator';

const email = body('email')
  .isEmail()
  .withMessage('email should be a valid email address')
  .matches(/^[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}$/)
  .withMessage('email must be a valid email address');

const password = body('password')
  .isString()
  .withMessage('password should be string')
  .isLength({ min: 6, max: 20 })
  .withMessage(
    'Password should be at least 6 characters long and no more than 20 characters',
  );

const login = body('login')
  .isString()
  .withMessage('login should be string')
  .isLength({ min: 3, max: 10 })
  .withMessage(
    'Logis should be at least 3 characters long and no more than 10 characters',
  )
  .matches(/^[a-zA-Z0-9_-]*$/)
  .withMessage('Login should be valid');

export const userInputDtoValidation = [email, password, login];
