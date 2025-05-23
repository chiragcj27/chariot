import { Schema, model } from "mongoose";

interface IPromotionalStrip {
    stripContent: string;
    stripLink: string;
}

const promotionalStripSchema = new Schema<IPromotionalStrip>({
    stripContent: {type: String, required: true},
    stripLink: {type: String, required: true},
});

export const PromotionalStrip = model<IPromotionalStrip>('PromotionalStrip', promotionalStripSchema);