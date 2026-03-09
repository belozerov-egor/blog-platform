import { Blog } from '../types/blogs';

export type BlogInputDto = Omit<Blog, 'id'>;
