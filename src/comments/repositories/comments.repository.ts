import { commentsCollection } from '../../db/mongo.db';
import { TComment } from '../domain/comment';
import { ObjectId } from 'mongodb';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

export const commentsRepository = {
  async create(newComment: TComment): Promise<string> {
    const insertPost = await commentsCollection.insertOne(newComment);
    return insertPost.insertedId.toString();
  },
  async delete(id: string): Promise<void> {
    const deleteComment = await commentsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteComment.deletedCount < 1) {
      throw new RepositoryNotFoundError(`Comment with id ${id} not found`);
    }
    return;
  },
  async update(id: string, content: string): Promise<void> {
    await commentsCollection.updateOne(
      { _id: new ObjectId(id) },
      { $set: { content } },
    );
    return;
  },
};
