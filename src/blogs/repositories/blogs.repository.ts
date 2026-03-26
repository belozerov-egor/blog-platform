import { blogsCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';
import { BlogsQueryInput } from '../routers/input/blogs-query.input';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { BlogAttributes } from '../application/dtos/blog-attributes';
import { Blog } from '../domain/blog';

export const blogsRepository = {
  async findMany(
    queryDto: BlogsQueryInput,
  ): Promise<{ items: WithId<Blog>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection, searchNameTerm } =
      queryDto;
    const filter: any = {};
    const skip = (pageNumber - 1) * pageSize;

    if (searchNameTerm) {
      filter.name = { $regex: searchNameTerm, $options: 'i' };
    }

    const items = await blogsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await blogsCollection.countDocuments(filter);
    return { items, totalCount };
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    const res = await blogsCollection.findOne({ _id: new ObjectId(id) });

    if (!res) {
      throw new RepositoryNotFoundError('Blog not exist');
    }
    return res;
  },

  async create(newBlog: Blog): Promise<string> {
    const insertResult = await blogsCollection.insertOne(newBlog);
    return insertResult.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new RepositoryNotFoundError('Blog not found');
    }
    return;
  },

  async update(id: string, dto: BlogAttributes): Promise<void> {
    const updateResult = await blogsCollection.updateOne(
      { _id: new ObjectId(id) },
      {
        $set: {
          name: dto.name,
          description: dto.description,
          websiteUrl: dto.websiteUrl,
        },
      },
    );
    if (updateResult.modifiedCount < 1) {
      throw new RepositoryNotFoundError('Blog not exist');
    }
    return;
  },
};
