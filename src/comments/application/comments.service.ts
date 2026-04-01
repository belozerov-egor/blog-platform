import { Commentator, CommentViewModel, TComment } from '../domain/comment';
import { commentsRepository } from '../repositories/comments.repository';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { commentsQueryRepository } from '../repositories/comments.query.repository';
import { CommentsSortField } from '../routers/input/comments-sort-field';
import { PaginationAndSorting } from '../../core/types/pagination-and-sorting';
import { postsService } from '../../posts/application/posts.service';
import { ForbiddenError } from '../../core/errors/forbidden.error';

export const commentsService = {
  async findManyComments(
    postId: string,
    dto: PaginationAndSorting<CommentsSortField>,
  ): Promise<{
    items: CommentViewModel[];
    totalCount: number;
    page: number;
    pageSize: number;
    pagesCount: number;
  }> {
    await postsService.findByIdOrFail(postId);
    return commentsQueryRepository.findMany(postId, dto);
  },
  async findByIdOrFail(id: string): Promise<CommentViewModel> {
    return commentsQueryRepository.findByIdOrFail(id);
  },
  async createComment(
    postId: string,
    content: string,
    commentatorInfo: Commentator,
  ): Promise<CommentViewModel> {
    const comment: TComment = {
      postId,
      content,
      commentatorInfo,
      createdAt: new Date(),
    };
    await postsRepository.findByIdOrFail(postId);
    const commentId = await commentsRepository.create(comment);
    return await commentsQueryRepository.findByIdOrFail(commentId);
  },
  async deleteComment(id: string, userId: string): Promise<void> {
    const comment = await commentsQueryRepository.findByIdOrFail(id);
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        'If try delete the comment that is not your own',
      );
    }
    await commentsRepository.delete(id);
  },
  async updateComment(
    id: string,
    content: string,
    userId: string,
  ): Promise<void> {
    const comment = await commentsQueryRepository.findByIdOrFail(id);
    console.log(comment);
    if (comment.commentatorInfo.userId !== userId) {
      throw new ForbiddenError(
        'If try update the comment that is not your own',
      );
    }
    await commentsRepository.update(id, content);
  },
};
