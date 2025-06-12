// Main entry point for the database package
import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage, ProductImage } from './models/image.model';
import { Item, Menu, SubCategory, IItem } from './models/menu.model';
import { IProduct, Product, PhysicalProduct, DigitalProduct, ServiceProduct } from './models/product.model';
import { PromotionalStrip } from './models/promotionalStrip.model';
import { IUser, ISeller, User, Seller} from './models/user.model';

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
  ProductImage,
  Seller,
  Product,
  PhysicalProduct,
  DigitalProduct,
  ServiceProduct,
};

export type {
  IImage,
  IItem,
  ISeller,
  IUser,
  IProduct,
};

export const hello = (): string => {
    return 'Hello from db package!';
  };