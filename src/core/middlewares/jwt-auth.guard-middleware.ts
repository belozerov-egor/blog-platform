import jwt from 'jsonwebtoken';
import { NextFunction, Request, Response } from 'express';
import { HttpStatus } from '../types/http-statuses';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';

export const jwtAuthGuardMiddleware = (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const authHeader = req.headers['authorization'];

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    res.sendStatus(HttpStatus.Unauthorized);
    return;
  }

  const token = authHeader.split(' ')[1];

  try {
    const payload = jwt.verify(token, JWT_SECRET) as {
      userId: string;
      userLogin: string;
    };

    req.user = {
      userId: payload.userId,
      userLogin: payload.userLogin,
    };

    next();
  } catch {
    res.sendStatus(HttpStatus.Unauthorized);
  }
};
