import { db } from '../../db/in-memory.db';
import { Blog, BlogsList } from '../types/blogs';
import { BlogInputDto } from '../dto/blog.input-dto';

export const blogsRepository = {
  findAll(): BlogsList {
    return db.blogs;
  },

  findById(id: string): Blog | null {
    return db.blogs.find((d) => d.id === id) ?? null; // Если результат поиска равно null или undefined, то вернем null.
  },

  create(newBlog: Blog): Blog {
    db.blogs.push(newBlog);

    return newBlog;
  },

  delete(id: string): void {
    const index = db.blogs.findIndex((v) => v.id === id);

    if (index === -1) {
      throw new Error('Driver not exist');
    }

    db.blogs.splice(index, 1);
    return;
  },

  update(id: string, dto: BlogInputDto): void {
    const blog = db.blogs.find((d) => d.id === id);

    if (!blog) {
      throw new Error('Driver not exist');
    }

    blog.name = dto.name;
    blog.description = dto.description;
    blog.websiteUrl = dto.websiteUrl;

    return;
  },
};
