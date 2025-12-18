// Main entry point for the database package
import connectDB from './config/database';
import { Image, ItemImage, PromotionalImage, IImage, ProductImage, KitImage, KitProductImage } from './models/image.model';
import { Item, Menu, IItem } from './models/menu.model';
import { IProduct, Product, PhysicalProduct, DigitalProduct, ServiceProduct, KitProduct, ProductType, ProductStatus, IKitProduct } from './models/product.model';
import { File, PdfFile, DocumentFile, ZipFile } from './models/file.model';
import { IFile, IPdfFile, IDocumentFile, IZipFile } from './models/file.model.d';
import { PromotionalStrip } from './models/promotionalStrip.model';
import { IUser, ISeller, IBuyer, User, Seller, Admin, Buyer} from './models/user.model';
import { Kit, IKit } from './models/kits.model';
import { Order, IOrder, OrderStatus, PaymentMethod, PaymentStatus } from './models/order.model';
import SubscriptionCard from './models/subscriptionCard.model';
import { IUserSubscription, UserSubscription } from './models/userSubscription.model';
import { OTP, IOTP } from './models/otp.model';
import { MarketplaceSettings, IMarketplaceSettings } from './models/marketplaceSettings.model';
import { Notification, INotification, NotificationType, NotificationStatus } from './models/notification.model';
import { Sale, ISale, SaleStatus } from './models/sales.model';
import { PayoutRequest, IPayoutRequest, PayoutRequestStatus } from './models/payoutRequest.model';

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
  Buyer,
  Product,
  PhysicalProduct,
  DigitalProduct,
  ServiceProduct,
  KitProduct,
  Admin,
  Kit,
  SubscriptionCard,
  UserSubscription,
  Order,
  File,
  PdfFile,
  DocumentFile,
  ZipFile,
  OTP,
  MarketplaceSettings,
  Notification,
  Sale,
  PayoutRequest,
};

export type {
  IImage,
  IItem,
  ISeller,
  IBuyer,
  IUser,
  IProduct,
  IKit,
  IOrder,
  IFile,
  IPdfFile,
  IDocumentFile,
  IZipFile,
  IOTP,
  IUserSubscription,
  IMarketplaceSettings,
  INotification,
  ISale,
  IPayoutRequest,
};

export {
  ProductType,
  ProductStatus,
  OrderStatus,
  PaymentMethod,
  PaymentStatus,
  NotificationType,
  NotificationStatus,
  SaleStatus,
  PayoutRequestStatus,
};

export const hello = (): string => {
    return 'Hello from db package!';
  };