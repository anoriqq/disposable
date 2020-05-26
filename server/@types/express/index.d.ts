declare namespace Express {
  export type User = import('../../lib/db').UserDocument;
  export interface Request {
    user?: User;
  }
}
