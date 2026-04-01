export {};

declare global {
  namespace Express {
    export interface Request {
      postId: string | null;
      user?: {
        userId: string;
        userLogin: string;
      };
    }
  }
}
