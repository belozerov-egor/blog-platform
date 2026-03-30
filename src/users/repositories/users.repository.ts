import { User } from '../domain/user';
import { usersCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

export const usersRepository = {
  async findByLoginOrEmail(loginOrEmail: string): Promise<WithId<User> | null> {
    return usersCollection.findOne({
      $or: [{ login: loginOrEmail }, { email: loginOrEmail }],
    });
  },

  async create(user: User): Promise<string> {
    const insertResult = await usersCollection.insertOne(user);
    return insertResult.insertedId.toString();
  },
  async delete(id: string): Promise<void> {
    const deleteResult = await usersCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new RepositoryNotFoundError('User not found');
    }
    return;
  },
};
