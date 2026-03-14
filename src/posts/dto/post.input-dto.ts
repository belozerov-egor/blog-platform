import { Post } from '../types/posts';

export type PostInputDto = Omit<Post, 'id' | 'blogName' | 'createdAt'>;
