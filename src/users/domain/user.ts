export type User = {
  login: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
};

export type UserViewModel = Omit<User, 'passwordHash'> & {
  id: string;
};
