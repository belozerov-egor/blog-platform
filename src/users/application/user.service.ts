import { bcryptService } from '../../auth/application/bcrypt.service';
import { User, UserViewModel } from '../domain/user';
import { usersRepository } from '../repositories/users.repository';
import { UserAttributes } from './dtos/user-attributes';
import { UserQueryInput } from '../routers/input/user-query-input';
import { usersQueryRepository } from '../repositories/users.query.repository';

export const usersService = {
  async findMany(queryDto: UserQueryInput): Promise<{
    items: UserViewModel[];
    totalCount: number;
    page: number;
    pageSize: number;
    pagesCount: number;
  }> {
    return usersQueryRepository.findMany(queryDto);
  },
  async findByIdOrFail(id: string): Promise<UserViewModel> {
    return usersQueryRepository.findByIdOrFail(id);
  },
  async create(dto: UserAttributes): Promise<string> {
    const { login, password, email } = dto;
    const passwordHash = await bcryptService.generateHash(password);

    const newUser: User = {
      login,
      email,
      passwordHash,
      createdAt: new Date(),
    };
    return await usersRepository.create(newUser);
  },

  async delete(id: string): Promise<void> {
    return await usersRepository.delete(id);
  },
};
