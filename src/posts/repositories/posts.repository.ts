import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../db/mongo.db';
import { Post } from '../domain/post';
import { PostAttributes } from '../application/dtos/post-attributes';
import { RepositoryNotFoundError } from '../../core/errors/repository-not-found.error';
import { PaginationAndSorting } from '../../core/types/pagination-and-sorting';
import { PostSortField } from '../routers/input/post-sort-field';

export const postsRepository = {
  async findMany(
    queryDto: PaginationAndSorting<PostSortField>,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter: any = {};
    const skip = (pageNumber - 1) * pageSize;

    const items = await postsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postsCollection.countDocuments(filter);
    return { items, totalCount };
  },

  async findForBlog(
    id: string,
    queryDto: PaginationAndSorting<PostSortField>,
  ): Promise<{ items: WithId<Post>[]; totalCount: number }> {
    const { pageNumber, pageSize, sortBy, sortDirection } = queryDto;
    const filter = { blogId: id };
    const skip = (pageNumber - 1) * pageSize;

    const items = await postsCollection
      .find(filter)
      .sort({ [sortBy]: sortDirection })
      .skip(skip)
      .limit(pageSize)
      .toArray();

    const totalCount = await postsCollection.countDocuments(filter);
    return { items, totalCount };
  },

  async findByIdOrFail(id: string): Promise<WithId<Post>> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    if (!post) {
      throw new RepositoryNotFoundError('Post not exist');
    }
    return post;
  },

  async create(newPost: Post): Promise<string> {
    const insertPost = await postsCollection.insertOne(newPost);
    return insertPost.insertedId.toString();
  },

  async delete(id: string): Promise<void> {
    const deletedPost = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deletedPost.deletedCount < 1) {
      throw new RepositoryNotFoundError('Post not exist');
    }
    return;
  },

  async update(id: string, dto: PostAttributes): Promise<void> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    const blog = await blogsRepository.findById(dto.blogId);

    if (!blog) {
      throw new RepositoryNotFoundError('Blog not exist');
    }

    if (!post) {
      throw new RepositoryNotFoundError('Post not exist');
    }
    await postsCollection.updateOne(
      {
        _id: post._id,
      },
      {
        $set: {
          title: dto.title,
          shortDescription: dto.shortDescription,
          content: dto.content,
          blogId: dto.blogId,
          blogName: blog.name,
          createdAt: post.createdAt,
        },
      },
    );

    return;
  },
};
