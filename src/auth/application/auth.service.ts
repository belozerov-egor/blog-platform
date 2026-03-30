import { usersRepository } from '../../users/repositories/users.repository';
import { bcryptService } from './bcrypt.service';
import { UnauthorizedError } from '../../core/errors/unauthorized.error';

export const authService = {
  async login(loginOrEmail: string, password: string): Promise<void> {
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
  },
};
