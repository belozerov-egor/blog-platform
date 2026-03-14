import { WithId } from 'mongodb';
import { Post, PostViewModel } from '../../types/posts';

export const mapToPostViewModel = (post: WithId<Post>): PostViewModel => {
  return {
    id: post._id.toString(),
    title: post.title,
    shortDescription: post.shortDescription,
    content: post.content,
    blogId: post.blogId,
    blogName: post.blogName,
    createdAt: post.createdAt,
  };
};
