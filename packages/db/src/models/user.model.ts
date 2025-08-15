import { Schema, Types, model, Document } from 'mongoose';
import mongoose from 'mongoose';

export type UserRole = 'admin' | 'buyer' | 'seller';

export interface IUser extends Document {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  refreshToken: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
  credits: number;
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
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending',
  },
  approvedAt: {
    type: Date,
  },
  approvedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  rejectionReason: {
    type: String,
  },
  rejectedAt: {
    type: Date,
  },
  rejectedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  credits: {
    type: Number,
    default: 0,
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

export interface ISeller extends Document {
  email: string;
  name: string;
  role: UserRole;
  password: string;
  refreshToken: string;
  approvalStatus: 'pending' | 'approved' | 'rejected';
  approvedAt?: Date;
  approvedBy?: Types.ObjectId;
  rejectionReason?: string;
  rejectedAt?: Date;
  rejectedBy?: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
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
  isBlacklisted: boolean;
  blacklistReason?: string;
  blacklistedAt?: Date;
  blacklistedBy?: Types.ObjectId;
  blacklistExpiryDate?: Date;
  reapplicationDate?: Date;
  reapplicationReason?: string;
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
  isBlacklisted: {
    type: Boolean,
    default: false,
  },
  blacklistReason: {
    type: String,
  },
  blacklistedAt: {
    type: Date,
  },
  blacklistedBy: {
    type: Schema.Types.ObjectId,
    ref: 'User',
  },
  blacklistExpiryDate: {
    type: Date,
  },
  reapplicationDate: {
    type: Date,
  },
  reapplicationReason: {
    type: String,
  },
}, {
  timestamps: true,           
});

if (mongoose.models.Seller) {
  delete mongoose.models.Seller;
}
export const Seller = User.discriminator<ISeller>('seller', sellerSchema);

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
export const Admin = User.discriminator<IAdmin>('admin', adminSchema);


enum MarketSegment {
  'Single Store Retailer',
  '2-5 Store Chains',
  '6-14 Store Chains',
  '15-29 Store Chains',
  '30+ Store Chains',
  'Wholesale/Distributor',
  'Buying Group',
  'Government Facilities',
  'Other',
}

enum BuyingOrganization {
  'AGS - American Gem Society',
  'BIG - Buyers International Group',
  'CBG - Continental Buying Group',
  'CJG - Canadian Jewellery Group',
  'IJO - Independent Jewelers Organization',
  'LJG - Leading Jewelers Guild', 
  'RJO - Retail Jewelers Organization',
  'SJO - Southeastern Jewelers Organization',
  'Other',
}


export interface IBuyer extends Omit<IUser, 'password'> {
  companyInformation: {
    name: string;
    address: string;
    country: string;
    state: string;
    zipcode: string;
    telephone: string[];
    fax: string[];
    websiteUrl: string;
  },
  contactInformation: {
    firstName: string;
    lastName: string;
    position: string;
    email: string;
    telephone: string[];
    fax: string[];
  },
  creditsPoints: number;
  userAccountId?: string; // Optional during signup, will be generated after approval
  password?: string; // Optional during signup, will be generated after approval
  isChariotCustomer: boolean;
  chariotCustomerId?: string;
  otherInformation:{
    primaryMarketSegment: MarketSegment;
    buyingOrganization: BuyingOrganization;
    TaxId: string;
    JBT_id: string;
    DUNN: string;
  }
}

const buyerSchema = new Schema<IBuyer>({
  companyInformation: {
    name: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    country: {
      type: String,
      required: true,
    },
    state: {
      type: String,
      required: true,
    },
    zipcode: {
      type: String,
      required: true,
    },
    telephone: {
      type: [String],
      required: true,
    },
    fax: {
      type: [String],
      default: [],
    },
    websiteUrl: {
      type: String,
      required: true,
    },
  },
  contactInformation: {
    firstName: {
      type: String,
      required: true,
    },
    lastName: {
      type: String,
      required: true,
    },
    position: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
    },
    telephone: {
      type: [String],
      required: true,
    },
    fax: {
      type: [String],
      default: [],
    },
  },
  creditsPoints: {
    type: Number,
    default: 0,
  },
  userAccountId: {
    type: String,
    unique: true,
    sparse: true, // Allow null/undefined values
  },
  password: {
    type: String,
    required: false, // Optional during signup, will be set after approval
  },
  isChariotCustomer: {
    type: Boolean,
    default: false,
  },
  chariotCustomerId: {
    type: String,
  },
  otherInformation: {
    primaryMarketSegment: {
      type: String,
      enum: [
        'Single Store Retailer',
        '2-5 Store Chains',
        '6-14 Store Chains',
        '15-29 Store Chains',
        '30+ Store Chains',
        'Wholesale/Distributor',
        'Buying Group',
        'Government Facilities',
        'Other',
      ],
      required: true,
    },
    buyingOrganization: {
      type: String,
      enum: [
        'AGS - American Gem Society',
        'BIG - Buyers International Group',
        'CBG - Continental Buying Group',
        'CJG - Canadian Jewellery Group',
        'IJO - Independent Jewelers Organization',
        'LJG - Leading Jewelers Guild', 
        'RJO - Retail Jewelers Organization',
        'SJO - Southeastern Jewelers Organization',
        'Other',
      ],
      required: true,
    },
    TaxId: {
      type: String,
      required: true,
    },
    JBT_id: {
      type: String,
      required: true,
    },
    DUNN: {
      type: String,
      required: true,
    },
  },
}, {
  timestamps: true,
});

if (mongoose.models.Buyer) {
  delete mongoose.models.Buyer;
}
export const Buyer = User.discriminator<IBuyer>('buyer', buyerSchema);