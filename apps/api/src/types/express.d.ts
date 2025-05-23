import { TokenPayload } from '@chariot/auth';

declare global {
  namespace Express {
    interface Request {
      user?: TokenPayload;
    }
  }
} 