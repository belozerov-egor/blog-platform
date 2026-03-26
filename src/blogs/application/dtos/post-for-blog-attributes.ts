import { PostAttributes } from '../../../posts/application/dtos/post-attributes';

export type PostForBlogAttributes = Omit<PostAttributes, 'blogId'>;
