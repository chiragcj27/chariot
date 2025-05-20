// Main entry point for the database package
import connectDB from './config/database';
import { User} from './models/user.model';

export {
  connectDB,
  User,
};

export const hello = (): string => {
    return 'Hello from db package!';
  };