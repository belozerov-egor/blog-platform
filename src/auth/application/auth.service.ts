import jwt from 'jsonwebtoken';
import { usersRepository } from '../../users/repositories/users.repository';
import { bcryptService } from './bcrypt.service';
import { UnauthorizedError } from '../../core/errors/unauthorized.error';
import { TMe } from '../domain/me';
import { usersQueryRepository } from '../../users/repositories/users.query.repository';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key';
const JWT_EXPIRES_IN = parseInt(
  process.env.JWT_EXPIRES_IN_SECONDS || '3600',
  10,
);

export const authService = {
  async login(
    loginOrEmail: string,
    password: string,
  ): Promise<{ accessToken: string }> {
    // Проверяем пользователя
    const user = await usersRepository.findByLoginOrEmail(loginOrEmail);
    if (!user) {
      throw new UnauthorizedError();
    }

    const isMatch = await bcryptService.checkPassword(
      password,
      user.passwordHash,
    );
    if (!isMatch) {
      throw new UnauthorizedError();
    }

    // Генерируем JWT
    const payload = {
      userId: user._id.toString(), // или user.id
      userLogin: user.login,
    };

    const accessToken = jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });

    return { accessToken };
  },
  async me(userId: string): Promise<TMe> {
    const user = await usersQueryRepository.findByIdOrFail(userId);
    if (!user) {
      throw new UnauthorizedError();
    }
    return {
      email: user.email,
      userId: user.id,
      login: user.login,
    };
  },
};
