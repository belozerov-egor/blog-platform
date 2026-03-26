import { WithId } from 'mongodb';
import { Blog, BlogViewModel } from '../../domain/blog';

export const mapToBlogViewModel = (blog: WithId<Blog>): BlogViewModel => {
  return {
    id: blog._id.toString(),
    name: blog.name,
    description: blog.description,
    websiteUrl: blog.websiteUrl,
    createdAt: blog.createdAt,
    isMembership: blog.isMembership,
  };
};
