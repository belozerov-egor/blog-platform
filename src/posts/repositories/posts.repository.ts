import { db } from '../../db/in-memory.db';
import { Post, PostsList } from '../types/posts';
import { PostInputDto } from '../dto/post.input-dto';

export const postsRepository = {
  findAll(): PostsList {
    return db.posts;
  },

  findById(id: string): Post | null {
    return db.posts.find((d) => d.id === id) ?? null; // Если результат поиска равно null или undefined, то вернем null.
  },

  create(newPost: Post): Post {
    db.posts.push(newPost);

    return newPost;
  },

  delete(id: string): void {
    const index = db.posts.findIndex((v) => v.id === id);

    if (index === -1) {
      throw new Error('Post not exist');
    }

    db.posts.splice(index, 1);
    return;
  },

  update(id: string, dto: PostInputDto): void {
    const post = db.posts.find((d) => d.id === id);
    const blog = db.blogs.find((b) => b.id === dto.blogId);

    if (!blog) {
      throw new Error('Blog not exist');
    }

    if (!post) {
      throw new Error('Post not exist');
    }

    post.title = dto.title;
    post.shortDescription = dto.shortDescription;
    post.content = dto.content;
    post.blogId = dto.blogId;
    post.blogName = blog.name;

    return;
  },
};
