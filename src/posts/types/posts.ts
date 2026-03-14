export type PostsList = Post[];

export type Post = {
  title: string;
  shortDescription: string;
  content: string;
  blogId: string;
  blogName: string;
  createdAt: Date;
};

export type PostViewModel = Post & {
  id: string;
};
