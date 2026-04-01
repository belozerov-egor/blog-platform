import { commentsCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { CommentViewModel, TComment } from '../domain/comment';
import { getPagesCount } from '../../core/helpers/get-pages-count';
import { CommentsSortField } from '../routers/input/comments-sort-field';
import { PaginationAndSorting } from '../../core/types/pagination-and-sorting';

export const commentsQueryRepository = {
  async findMany(
    postId: string,
    dto: PaginationAndSorting<CommentsSortField>,
  ): Promise<{
    items: CommentViewModel[];
    totalCount: number;
    page: number;
    pageSize: number;
    pagesCount: number;
  }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = dto;
    const skip = (pageNumber - 1) * pageSize;

    const filter = {
      postId: postId,
    };

    const [items, totalCount] = await Promise.all([
      commentsCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      commentsCollection.countDocuments(filter),
    ]);

    return {
      items: items.map(mapToView),
      totalCount,
      page: pageNumber,
      pageSize,
      pagesCount: getPagesCount(pageSize, totalCount),
    };
  },
  async findByIdOrFail(id: string): Promise<CommentViewModel> {
    const res = await commentsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Comment not exist');
    }
    return mapToView(res);
  },
};

const mapToView = (comment: WithId<TComment>): CommentViewModel => {
  return {
    id: comment._id.toString(),
    content: comment.content,
    commentatorInfo: {
      userId: comment.commentatorInfo.userId,
      userLogin: comment.commentatorInfo.userLogin,
    },
    createdAt: comment.createdAt,
  };
};
