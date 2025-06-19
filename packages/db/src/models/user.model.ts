import { Schema, Types, model } from 'mongoose';
import mongoose from 'mongoose';

export type UserRole = 'admin' | 'buyer' | 'seller';

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  refreshToken: string;
  createdAt: Date;
  updatedAt: Date;
}

const userSchema = new Schema<IUser>({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  name: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    enum: ['admin', 'buyer', 'seller'],
    default: 'buyer',
  },
  password: {
    type: String,
    required: true,
  },
  refreshToken: {
    type: String,
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
},
{
    discriminatorKey: 'role',
    timestamps: true,
});

if (mongoose.models.User) {
  delete mongoose.models.User;
}
export const User = model<IUser>('User', userSchema);

export interface ISeller extends IUser {
  storeDetails: {
    name: string;
    description: string;
    address: string;
    phone: string;
    email: string;
  }
  products: Types.ObjectId[];
  orders: Types.ObjectId[];
  sales: Types.ObjectId[];
  commissionRate: number;
}

const sellerSchema = new Schema<ISeller>({
  storeDetails: {
    name: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
  },
  products: {
    type: [Schema.Types.ObjectId],
    ref: "Product",
  },
  orders: {
    type: [Schema.Types.ObjectId],
    ref: "Order",
  },
  sales: {
    type: [Schema.Types.ObjectId],
    ref: "Order",
  },
  commissionRate: {
    type: Number,
    required: true,
  },
}, {
  timestamps: true,           
});

if (mongoose.models.Seller) {
  delete mongoose.models.Seller;
}
export const Seller = User.discriminator<ISeller>('Seller', sellerSchema);

export interface IAdmin extends IUser {
  isSuperAdmin: boolean;
}

const adminSchema = new Schema<IAdmin>({
  isSuperAdmin: {
    type: Boolean,
    default: false,
  },
}, {
  timestamps: true,
});

if (mongoose.models.Admin) {
  delete mongoose.models.Admin;
}
export const Admin = User.discriminator<IAdmin>('Admin', adminSchema);