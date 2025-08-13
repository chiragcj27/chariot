// Main entry point for the database package
import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage, ProductImage, KitImage, KitProductImage } from './models/image.model';
import { Item, Menu, IItem } from './models/menu.model';
import { IProduct, Product, PhysicalProduct, DigitalProduct, ServiceProduct, KitProduct, ProductType, ProductStatus, IKitProduct } from './models/product.model';
import { File, PdfFile, DocumentFile, ZipFile } from './models/file.model';
import { IFile, IPdfFile, IDocumentFile, IZipFile } from './models/file.model.d';
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
  KitProductImage,
  Seller,
  Product,
  PhysicalProduct,
  DigitalProduct,
  ServiceProduct,
  KitProduct,
  Admin,
  Kit,
  SubscriptionCard,
  UserSubscription,
  File,
  PdfFile,
  DocumentFile,
  ZipFile
};

export type {
  IImage,
  IItem,
  ISeller,
  IUser,
  IProduct,
  IKitProduct,
  IKit,
  ProductStatus,
  IUserSubscription,
  IFile,
  IPdfFile,
  IDocumentFile,
  IZipFile,
};

export { ProductType };

export const hello = (): string => {
    return 'Hello from db package!';
  };