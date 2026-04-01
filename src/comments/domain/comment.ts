export type TComment = {
  postId: string;
  content: string;
  commentatorInfo: Commentator;
  createdAt: Date;
};

export type Commentator = {
  userId: string;
  userLogin: string;
};

export type CommentViewModel = Omit<Comment, 'postId'> & {
  id: string;
};
