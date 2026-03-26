export type Blog = {
  name: string;
  description: string;
  websiteUrl: string;
  isMembership: boolean;
  createdAt: Date;
};

export type BlogViewModel = Blog & {
  id: string;
};
