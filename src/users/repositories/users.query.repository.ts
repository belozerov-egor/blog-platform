import { usersCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { User, UserViewModel } from '../domain/user';
import { UserQueryInput } from '../routers/input/user-query-input';
import { getPagesCount } from '../../core/helpers/get-pages-count';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';

export const usersQueryRepository = {
  async findMany(dto: UserQueryInput): Promise<{
    items: UserViewModel[];
    totalCount: number;
    page: number;
    pageSize: number;
    pagesCount: number;
  }> {
    const {
      pageNumber,
      pageSize,
      sortBy,
      sortDirection,
      searchLoginTerm,
      searchEmailTerm,
    } = dto;
    const skip = (pageNumber - 1) * pageSize;

    const filter: any = {};
    const searchConditions = [];

    if (searchLoginTerm) {
      searchConditions.push({
        login: { $regex: searchLoginTerm, $options: 'i' },
      });
    }
    if (searchEmailTerm) {
      searchConditions.push({
        email: { $regex: searchEmailTerm, $options: 'i' },
      });
    }
    if (searchConditions.length > 0) {
      filter.$or = searchConditions;
    }

    const [items, totalCount] = await Promise.all([
      usersCollection
        .find(filter)
        .sort({ [sortBy]: sortDirection })
        .skip(skip)
        .limit(pageSize)
        .toArray(),
      usersCollection.countDocuments(filter),
    ]);

    return {
      items: items.map(mapToView),
      totalCount,
      page: pageNumber,
      pageSize,
      pagesCount: getPagesCount(pageSize, totalCount),
    };
  },
  async findByIdOrFail(id: string): Promise<UserViewModel> {
    const res = await usersCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Blog not exist');
    }
    return mapToView(res);
  },
};

function mapToView(user: WithId<User>): UserViewModel {
  return {
    id: user._id.toString(),
    login: user.login,
    email: user.email,
    createdAt: user.createdAt,
  };
}
