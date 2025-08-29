import mongoose, { model, Schema, Document } from "mongoose";

export interface IMarketplaceSettings extends Document {
  // Commission settings
  defaultCommissionRate: number; // Default commission rate for all sellers
  commissionRates: Map<string, number>; // Individual seller commission rates
  
  // Tax settings
  defaultTaxRate: number; // Default tax rate for all products
  taxRates: Map<string, number>; // Category-specific tax rates
  
  // Notification settings
  emailNotifications: boolean;
  smsNotifications: boolean;
  
  // Payment settings
  minimumPayoutAmount: number;
  payoutSchedule: 'weekly' | 'monthly' | 'on-demand';
  
  // General settings
  currency: string;
  siteName: string;
  contactEmail: string;
  
  createdAt: Date;
  updatedAt: Date;
}

const marketplaceSettingsSchema = new Schema<IMarketplaceSettings>(
  {
    defaultCommissionRate: {
      type: Number,
      required: true,
      default: 5.0, // 5% default commission
      min: 0,
      max: 100,
    },
    commissionRates: {
      type: Map,
      of: Number,
      default: {},
    },
    defaultTaxRate: {
      type: Number,
      required: true,
      default: 12.5, // 12.5% default tax
      min: 0,
      max: 100,
    },
    taxRates: {
      type: Map,
      of: Number,
      default: {},
    },
    emailNotifications: {
      type: Boolean,
      default: true,
    },
    smsNotifications: {
      type: Boolean,
      default: false,
    },
    minimumPayoutAmount: {
      type: Number,
      required: true,
      default: 100, // $100 minimum payout
      min: 0,
    },
    payoutSchedule: {
      type: String,
      enum: ['weekly', 'monthly', 'on-demand'],
      default: 'monthly',
    },
    currency: {
      type: String,
      default: 'USD',
    },
    siteName: {
      type: String,
      default: 'Chariot Marketplace',
    },
    contactEmail: {
      type: String,
      default: 'support@chariot.com',
    },
  },
  {
    timestamps: true,
  }
);

if (mongoose.models.MarketplaceSettings) {
  delete mongoose.models.MarketplaceSettings;
}

export const MarketplaceSettings = model<IMarketplaceSettings>(
  "MarketplaceSettings",
  marketplaceSettingsSchema
);
