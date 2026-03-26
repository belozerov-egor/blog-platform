import { BlogsQueryInput } from '../routers/input/blogs-query.input';
import { WithId } from 'mongodb';
import { blogsRepository } from '../repositories/blogs.repository';
import { BlogAttributes } from './dtos/blog-attributes';
import { Blog } from '../domain/blog';
import { PostForBlogAttributes } from './dtos/post-for-blog-attributes';
import { postsRepository } from '../../posts/repositories/posts.repository';
import { Post } from '../../posts/domain/post';

export const blogsService = {
  async findMany(queryDto: BlogsQueryInput): Promise<{
    items: WithId<Blog>[];
    totalCount: number;
  }> {
    return blogsRepository.findMany(queryDto);
  },
  async findByIdOrFail(id: string): Promise<WithId<Blog>> {
    return blogsRepository.findByIdOrFail(id);
  },
  async create(dto: BlogAttributes): Promise<string> {
    const newBlog: Blog = {
      name: dto.name,
      description: dto.description,
      websiteUrl: dto.websiteUrl,
      createdAt: new Date(),
      isMembership: false,
    };
    return blogsRepository.create(newBlog);
  },
  async update(id: string, dto: BlogAttributes): Promise<void> {
    await blogsRepository.update(id, dto);
    return;
  },
  async delete(id: string): Promise<void> {
    await blogsRepository.delete(id);
  },
  async createPost(id: string, dto: PostForBlogAttributes): Promise<string> {
    const blog = await blogsRepository.findByIdOrFail(id);
    const newPost: Post = {
      title: dto.title,
      shortDescription: dto.shortDescription,
      content: dto.content,
      blogId: id,
      blogName: blog.name,
      createdAt: new Date(),
    };
    return postsRepository.create(newPost);
  },
};
