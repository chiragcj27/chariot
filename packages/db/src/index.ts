// Main entry point for the database package
import connectDB from './config/database';
import { Item, Menu, SubCategory } from './models/menu.model';
import { PromotionalStrip } from './models/promotionalStrip.model';
import { User} from './models/user.model';

export {
  connectDB,
  User,
  Menu,
  PromotionalStrip,
  SubCategory,
  Item,
};

export const hello = (): string => {
    return 'Hello from db package!';
  };