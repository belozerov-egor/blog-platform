import { Post } from '../../domain/post';

export type PostAttributes = Omit<Post, 'id' | 'blogName' | 'createdAt'>;
