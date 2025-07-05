import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage, ProductImage } from './models/image.model';
import { Item, Menu, IItem } from './models/menu.model';
import { IProduct, Product, PhysicalProduct, DigitalProduct, ServiceProduct, ProductType, ProductStatus } from './models/product.model';
import { PromotionalStrip } from './models/promotionalStrip.model';
import { IUser, ISeller, User, Seller, Admin } from './models/user.model';

export {
  connectDB,
  User,
  Menu,
  PromotionalStrip,
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
  Admin,
};

export type {
  IImage,
  IItem,
  ISeller,
  IUser,
  IProduct,
  ProductStatus,
};

export { ProductType };

export const hello = (): string => {
    return 'Hello from db package!';
  };
