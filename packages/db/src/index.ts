// Main entry point for the database package
import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage } from './models/image.model';
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
  Image,
  ItemImage,
  PromotionalImage,
  IImage
};

export const hello = (): string => {
    return 'Hello from db package!';
  };