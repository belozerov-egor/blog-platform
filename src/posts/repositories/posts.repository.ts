import { Post } from '../types/posts';
import { PostInputDto } from '../dto/post.input-dto';
import { blogsRepository } from '../../blogs/repositories/blogs.repository';
import { ObjectId, WithId } from 'mongodb';
import { postsCollection } from '../../db/mongo.db';

export const postsRepository = {
  async findAll(): Promise<WithId<Post>[]> {
    return postsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<Post> | null> {
    return postsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newPost: Post): Promise<WithId<Post> | null> {
    const insertPost = await postsCollection.insertOne(newPost);
    return await postsCollection.findOne({
      _id: insertPost.insertedId,
    });
  },

  async delete(id: string): Promise<void> {
    const deletedPost = await postsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deletedPost.deletedCount < 1) {
      throw new Error('Post not deleted');
    }
    return;
  },

  async update(id: string, dto: PostInputDto): Promise<void> {
    const post = await postsCollection.findOne({ _id: new ObjectId(id) });
    const blog = await blogsRepository.findById(dto.blogId);

    if (!blog) {
      throw new Error('Blog not exist');
    }

    if (!post) {
      throw new Error('Post not exist');
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
