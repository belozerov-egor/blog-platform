import { User } from '../../domain/user';

export type UserAttributes = Omit<User, 'createdAt' | 'passwordHash'> & {
  password: string;
};
