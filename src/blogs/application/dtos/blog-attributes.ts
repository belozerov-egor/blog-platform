import { Blog } from '../../domain/blog';

export type BlogAttributes = Omit<Blog, 'id' | 'createdAt' | 'isMembership'>;
