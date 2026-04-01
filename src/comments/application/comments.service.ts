import { Commentator, TComment } from '../domain/comment';
import { commentsRepository } from '../repositories/comments.repository';

export const commentsService = {
  async createComment(
    postId: string,
    content: string,
    commentatorInfo: Commentator,
  ) {
    const comment: TComment = {
      postId,
      content,
      commentatorInfo,
      createdAt: new Date(),
    };
    return await commentsRepository.create(comment);
  },
};
