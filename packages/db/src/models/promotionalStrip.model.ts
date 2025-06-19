import { Schema, model } from "mongoose";
import mongoose from "mongoose";

interface IPromotionalStrip {
    stripContent: string;
    stripLink: string;
}

const promotionalStripSchema = new Schema<IPromotionalStrip>({
    stripContent: {type: String, required: true},
    stripLink: {type: String, required: true},
});

if (mongoose.models.PromotionalStrip) {
    delete mongoose.models.PromotionalStrip;
}
export const PromotionalStrip = model<IPromotionalStrip>('PromotionalStrip', promotionalStripSchema);