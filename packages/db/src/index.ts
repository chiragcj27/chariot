// Main entry point for the database package
import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage, ProductImage, KitImage } from './models/image.model';
import { Item, Menu, IItem } from './models/menu.model';
import { IProduct, Product, PhysicalProduct, DigitalProduct, ServiceProduct, ProductType, ProductStatus } from './models/product.model';
import { PromotionalStrip } from './models/promotionalStrip.model';
import { IUser, ISeller, User, Seller, Admin} from './models/user.model';
import { Kit, IKit } from './models/kits.model';
import SubscriptionCard from './models/subscriptionCard.model';
import { IUserSubscription, UserSubscription } from './models/userSubscription.model';

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
  KitImage,
  Seller,
  Product,
  PhysicalProduct,
  DigitalProduct,
  ServiceProduct,
  Admin,
  Kit,
  SubscriptionCard,
  UserSubscription
};

export type {
  IImage,
  IItem,
  ISeller,
  IUser,
  IProduct,
  IKit,
  ProductStatus,
  IUserSubscription,
};

export { ProductType };

export const hello = (): string => {
    return 'Hello from db package!';
  };