import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionCard extends Document {
  title: string;
  price: number;
  period: string;
  description: string;
  features: string[];
  button: string;
  paypalPlanId: string;
  credits: number;
  planKey: string;
}

const SubscriptionCardSchema: Schema = new Schema({
  title: { type: String, required: true },
  price: { type: Number, required: true },
  period: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], required: true },
  button: { type: String, required: true },
  paypalPlanId: { type: String, required: true, unique: true },
  credits: { type: Number, required: true },
  planKey: { type: String, required: true, unique: true },
});

export default mongoose.models.SubscriptionCard || mongoose.model<ISubscriptionCard>("SubscriptionCard", SubscriptionCardSchema); 