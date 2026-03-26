import { WithId } from 'mongodb';
import { PaginationAndSorting } from '../../core/types/pagination-and-sorting';
import { PostSortField } from '../routers/input/post-sort-field';
import { Post } from '../domain/post';
import { postsRepository } from '../repositories/posts.repository';
import { PostAttributes } from './dtos/post-attributes';
import { blogsService } from '../../blogs/application/blogs.service';

export const postsService = {
  async findMany(queryDto: PaginationAndSorting<PostSortField>): Promise<{
    items: WithId<Post>[];
    totalCount: number;
  }> {
    return postsRepository.findMany(queryDto);
  },
  async findByIdOrFail(id: string): Promise<WithId<Post>> {
    return postsRepository.findByIdOrFail(id);
  },
  async findForBlog(
    blogId: string,
    queryDto: PaginationAndSorting<PostSortField>,
  ): Promise<{
    items: WithId<Post>[];
    totalCount: number;
  }> {
    await blogsService.findByIdOrFail(blogId);
    return postsRepository.findForBlog(blogId, queryDto);
  },
  async create(dto: PostAttributes): Promise<string> {
    const blog = await blogsService.findByIdOrFail(dto.blogId);
    const newBlog: Post = {
      title: dto.title,
      content: dto.content,
      blogId: dto.blogId,
      shortDescription: dto.shortDescription,
      blogName: blog.name,
      createdAt: new Date(),
    };
    return postsRepository.create(newBlog);
  },
  async update(id: string, dto: PostAttributes): Promise<void> {
    await postsRepository.update(id, dto);
    return;
  },
  async delete(id: string): Promise<void> {
    await postsRepository.delete(id);
  },
};
