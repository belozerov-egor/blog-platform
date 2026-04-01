import { commentsCollection } from '../../db/mongo.db';
import { TComment } from '../domain/comment';

export const commentsRepository = {
  async create(newComment: TComment): Promise<string> {
    const insertPost = await commentsCollection.insertOne(newComment);
    return insertPost.insertedId.toString();
  },
};
