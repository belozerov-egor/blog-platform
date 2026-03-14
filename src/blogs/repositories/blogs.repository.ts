import { Blog } from '../types/blogs';
import { BlogInputDto } from '../dto/blog.input-dto';
import { blogsCollection } from '../../db/mongo.db';
import { ObjectId, WithId } from 'mongodb';

export const blogsRepository = {
  async findAll(): Promise<WithId<Blog>[]> {
    return blogsCollection.find().toArray();
  },

  async findById(id: string): Promise<WithId<Blog> | null> {
    return blogsCollection.findOne({ _id: new ObjectId(id) });
  },

  async create(newBlog: Blog): Promise<WithId<Blog> | null> {
    const insertResult = await blogsCollection.insertOne(newBlog);
    return await blogsCollection.findOne({
      _id: insertResult.insertedId,
    });
  },

  async delete(id: string): Promise<void> {
    const deleteResult = await blogsCollection.deleteOne({
      _id: new ObjectId(id),
    });
    if (deleteResult.deletedCount < 1) {
      throw new Error('Blog not found');
    }
    return;
  },

  async update(id: string, dto: BlogInputDto): Promise<void> {
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
      throw new Error('Blog not found');
    }
    return;
  },
};
