import mongoose, { Schema, Document, Types } from "mongoose";

export interface IUserSubscription extends Document {
  userId: Types.ObjectId;
  planId: Types.ObjectId;
  paypalSubscriptionId: string;
  status: 'active' | 'canceled' | 'past_due' | 'pending' | 'expired';
  startDate: Date;
  endDate?: Date;
  lastPaymentDate?: Date;
  nextBillingDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserSubscriptionSchema: Schema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
  planId: { type: Schema.Types.ObjectId, ref: 'SubscriptionCard', required: true },
  paypalSubscriptionId: { type: String, required: true, unique: true },
  status: { type: String, enum: ['active', 'canceled', 'past_due', 'pending', 'expired'], required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  lastPaymentDate: { type: Date },
  nextBillingDate: { type: Date },
}, {
  timestamps: true,
});

if (mongoose.models.UserSubscription) {
  delete mongoose.models.UserSubscription;
}
export const UserSubscription = mongoose.model<IUserSubscription>("UserSubscription", UserSubscriptionSchema); 