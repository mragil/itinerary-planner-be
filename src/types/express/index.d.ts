import { TokenPayload } from 'src/modules/app.types';

export {};

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
}
