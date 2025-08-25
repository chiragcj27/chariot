import mongoose, { model, Schema, Types } from "mongoose";

export enum OrderStatus {
  PENDING = "pending",
  PAID = "paid",
  PROCESSING = "processing",
  SHIPPED = "shipped",
  DELIVERED = "delivered",
  CANCELLED = "cancelled",
  REFUNDED = "refunded",
}

export enum PaymentMethod {
  CREDITS = "credits",
  PAYPAL = "paypal",
  MIXED = "mixed", // credits + paypal
}

export enum PaymentStatus {
  PENDING = "pending",
  COMPLETED = "completed",
  FAILED = "failed",
  PARTIAL = "partial",
}

export interface IOrderItem {
  productId: Types.ObjectId;
  productName: string;
  productSlug: string;
  quantity: number;
  unitPrice: number; // in dollars
  unitCreditsCost: number; // in credits
  totalPrice: number; // in dollars
  totalCreditsCost: number; // in credits
  imageUrl?: string;
}

export interface IPaymentBreakdown {
  creditsUsed: number;
  creditsAmount: number; // in dollars
  paypalAmount: number; // in dollars
  totalAmount: number; // in dollars
}

export interface IOrder extends Document {
  orderNumber: string;
  userId: Types.ObjectId;
  items: IOrderItem[];
  subtotal: number; // in dollars
  tax: number; // in dollars
  total: number; // in dollars
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  paymentBreakdown: IPaymentBreakdown;
  status: OrderStatus;
  createdAt: Date;
  updatedAt: Date;
  paypalOrderId?: string;
  paypalPaymentId?: string;
}

const orderItemSchema = new Schema<IOrderItem>({
  productId: {
    type: Schema.Types.ObjectId,
    ref: "Product",
    required: true,
  },
  productName: {
    type: String,
    required: true,
  },
  productSlug: {
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
  unitCreditsCost: {
    type: Number,
    required: true,
    min: 0,
  },
  totalPrice: {
    type: Number,
    required: true,
    min: 0,
  },
  totalCreditsCost: {
    type: Number,
    required: true,
    min: 0,
  },
  imageUrl: {
    type: String,
  },
});

const paymentBreakdownSchema = new Schema<IPaymentBreakdown>({
  creditsUsed: {
    type: Number,
    required: true,
    min: 0,
  },
  creditsAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  paypalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
  totalAmount: {
    type: Number,
    required: true,
    min: 0,
  },
});

const orderSchema = new Schema<IOrder>(
  {
    orderNumber: {
      type: String,
      required: true,
      unique: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    items: [orderItemSchema],
    subtotal: {
      type: Number,
      required: true,
      min: 0,
    },
    tax: {
      type: Number,
      required: true,
      min: 0,
    },
    total: {
      type: Number,
      required: true,
      min: 0,
    },
    paymentMethod: {
      type: String,
      enum: Object.values(PaymentMethod),
      required: true,
    },
    paymentStatus: {
      type: String,
      enum: Object.values(PaymentStatus),
      default: PaymentStatus.PENDING,
    },
    paymentBreakdown: {
      type: paymentBreakdownSchema,
      required: true,
    },
    status: {
      type: String,
      enum: Object.values(OrderStatus),
      default: OrderStatus.PENDING,
    },
    paypalOrderId: {
      type: String,
    },
    paypalPaymentId: {
      type: String,
    },
  },
  {
    timestamps: true,
  }
);

// Generate order number
orderSchema.pre("save", async function (next) {
  if (this.isNew && !this.orderNumber) {
    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    
    // Get count of orders for today
    const todayStart = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    const todayEnd = new Date(date.getFullYear(), date.getMonth(), date.getDate() + 1);
    
    try {
      const count = await mongoose.model("Order").countDocuments({
        createdAt: { $gte: todayStart, $lt: todayEnd }
      });
      
      this.orderNumber = `ORD-${year}${month}${day}-${String(count + 1).padStart(3, "0")}`;
    } catch (error) {
      // Fallback if count fails
      this.orderNumber = `ORD-${year}${month}${day}-${Date.now()}`;
    }
  }
  next();
});

if (mongoose.models.Order) {
  delete mongoose.models.Order;
}

export const Order = model<IOrder>("Order", orderSchema);
