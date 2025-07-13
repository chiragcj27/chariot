import { Types, Schema, model } from "mongoose";

enum KitType {
    PREMIUM = "premium",
    BASIC = "basic",
}

export interface IKit {
    title: string;
    slug: string;
    description: string;
    thumbnail?: Types.ObjectId;
    mainImage?: Types.ObjectId;
    onHoverImage?: Types.ObjectId;
    carouselImages: Types.ObjectId[];
    testimonials?: string[];
}

export const KitSchema = new Schema<IKit>({
    title: { type: String, required: true },
    slug: { type: String, required: true },
    description: { type: String, required: true },
    thumbnail: { type: Schema.Types.ObjectId, ref: "Image" },
    mainImage: { type: Schema.Types.ObjectId, ref: "Image" },
    onHoverImage: { type: Schema.Types.ObjectId, ref: "Image" },
    carouselImages: [{ type: Schema.Types.ObjectId, ref: "Image"}],
    testimonials: [{ type: String }],
}, {
    timestamps: true,
});

export const Kit = model<IKit>("Kit", KitSchema);