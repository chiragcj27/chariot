import mongoose, { Schema, Document } from "mongoose";

export interface ISubscriptionCard extends Document {
  title: string;
  price: string;
  period: string;
  description: string;
  features: string[];
  button: string;
}

const SubscriptionCardSchema: Schema = new Schema({
  title: { type: String, required: true },
  price: { type: String, required: true },
  period: { type: String, required: true },
  description: { type: String, required: true },
  features: { type: [String], required: true },
  button: { type: String, required: true },
});

export default mongoose.models.SubscriptionCard || mongoose.model<ISubscriptionCard>("SubscriptionCard", SubscriptionCardSchema); 