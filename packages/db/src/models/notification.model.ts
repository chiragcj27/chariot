import mongoose, { model, Schema, Types, Document } from "mongoose";

export enum NotificationType {
  SALE = "sale",
  ORDER_STATUS = "order_status",
  PAYMENT_RECEIVED = "payment_received",
  COMMISSION_EARNED = "commission_earned",
  PRODUCT_APPROVED = "product_approved",
  PRODUCT_REJECTED = "product_rejected",
  ACCOUNT_APPROVED = "account_approved",
  ACCOUNT_REJECTED = "account_rejected",
  SYSTEM_ALERT = "system_alert",
}

export enum NotificationStatus {
  UNREAD = "unread",
  READ = "read",
  ARCHIVED = "archived",
}

export interface INotification extends Document {
  recipientId: Types.ObjectId;
  recipientType: 'seller' | 'admin' | 'buyer';
  type: NotificationType;
  title: string;
  message: string;
  status: NotificationStatus;
  
  // Related data
  orderId?: Types.ObjectId;
  productId?: Types.ObjectId;
  sellerId?: Types.ObjectId;
  buyerId?: Types.ObjectId;
  
  // Additional data for specific notification types
  metadata?: {
    saleAmount?: number;
    commissionAmount?: number;
    orderNumber?: string;
    productName?: string;
    [key: string]: any;
  };
  
  // Email/SMS tracking
  emailSent?: boolean;
  emailSentAt?: Date;
  smsSent?: boolean;
  smsSentAt?: Date;
  
  createdAt: Date;
  updatedAt: Date;
  readAt?: Date;
}

const notificationSchema = new Schema<INotification>(
  {
    recipientId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    recipientType: {
      type: String,
      enum: ['seller', 'admin', 'buyer'],
      required: true,
    },
    type: {
      type: String,
      enum: Object.values(NotificationType),
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    message: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(NotificationStatus),
      default: NotificationStatus.UNREAD,
    },
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
    emailSent: {
      type: Boolean,
      default: false,
    },
    emailSentAt: {
      type: Date,
    },
    smsSent: {
      type: Boolean,
      default: false,
    },
    smsSentAt: {
      type: Date,
    },
    readAt: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Index for efficient querying
notificationSchema.index({ recipientId: 1, status: 1, createdAt: -1 });
notificationSchema.index({ type: 1, createdAt: -1 });

if (mongoose.models.Notification) {
  delete mongoose.models.Notification;
}

export const Notification = model<INotification>("Notification", notificationSchema);
