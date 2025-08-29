import mongoose, { model, Schema, Types, Document } from "mongoose";

export enum SaleStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export interface ISale extends Document {
  orderId: Types.ObjectId;
  orderNumber: string;
  
  // Product and seller information
  productId: Types.ObjectId;
  productName: string;
  productSku: string;
  sellerId: Types.ObjectId;
  sellerName: string;
  
  // Buyer information
  buyerId: Types.ObjectId;
  buyerName: string;
  
  // Sale details
  quantity: number;
  unitPrice: number;
  subtotal: number;
  taxAmount: number;
  totalAmount: number;
  
  // Commission and earnings
  commissionRate: number;
  commissionAmount: number;
  sellerEarnings: number;
  platformEarnings: number;
  
  // Payment information
  paymentMethod: string;
  paymentStatus: string;
  
  // Status and tracking
  status: SaleStatus;
  saleDate: Date;
  
  // Additional metadata
  metadata?: {
    categoryId?: Types.ObjectId;
    categoryName?: string;
    taxRate?: number;
    [key: string]: any;
  };
  
  createdAt: Date;
  updatedAt: Date;
}

const saleSchema = new Schema<ISale>(
  {
    orderId: {
      type: Schema.Types.ObjectId,
      ref: "Order",
      required: true,
    },
    orderNumber: {
      type: String,
      required: true,
    },
    productId: {
      type: Schema.Types.ObjectId,
      ref: "Product",
      required: true,
    },
    productName: {
      type: String,
      required: true,
    },
    productSku: {
      type: String,
      required: true,
    },
    sellerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    sellerName: {
      type: String,
      required: true,
    },
    buyerId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    buyerName: {
      type: String,
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      min: 1,
    },
    unitPrice: {
      type: Number,
      required: true,
      min: 0,
    },
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    taxAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    totalAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    commissionRate: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    commissionAmount: {
      type: Number,
      required: true,
      min: 0,
    },
    sellerEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    platformEarnings: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      required: true,
    },
    paymentStatus: {
      type: String,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(SaleStatus),
      default: SaleStatus.PENDING,
    },
    saleDate: {
      type: Date,
      default: Date.now,
    },
    metadata: {
      type: Schema.Types.Mixed,
      default: {},
    },
  },
  {
    timestamps: true,
  }
);

// Indexes for efficient querying
saleSchema.index({ sellerId: 1, saleDate: -1 });
saleSchema.index({ orderId: 1 });
saleSchema.index({ productId: 1 });
saleSchema.index({ status: 1, saleDate: -1 });
saleSchema.index({ productSku: 1 });

if (mongoose.models.Sale) {
  delete mongoose.models.Sale;
}

export const Sale = model<ISale>("Sale", saleSchema);
