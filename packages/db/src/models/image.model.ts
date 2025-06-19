import mongoose, { model, Schema, Document, Types } from "mongoose";

// Base image interface
export interface IImage extends Document {
    filename: string;
    originalname: string;
    url: string;
    size: number;
    mimetype: string;
    width?: number;
    height?: number;
    bucket?: string;
    status: 'pending' | 'uploaded' | 'failed';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    imageType: string
}

// Base image schema
const imageSchema = new Schema<IImage>({
    filename: {
        type: String,
        required: true,
    },
    originalname: {
        type: String,
        required: true,
    },
    url: {
        type: String,
        required: true,
    },
    size: {
        type: Number,
        required: true,
    },
    mimetype: {
        type: String,
        required: true,
    },
    width: {
        type: Number,
    },
    height: {
        type: Number,
    },
    bucket: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'uploaded', 'failed'],
        default: 'pending',
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
    imageType: {
        type: String,
        required: true,
        enum: ['profile', 'product', 'menu', 'featured', 'promotional', 'item'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    discriminatorKey: 'imageType',
    timestamps: true,
});

// Promotional Image Schema
interface IPromotionalImage extends IImage {
    redirectUrl: string;
}

const promotionalImageSchema = new Schema<IPromotionalImage>({
    redirectUrl: {
        type: String,
        required: true,
    },
});

export interface IItemImage extends IImage {
    itemId: Types.ObjectId;
}
const itemImageSchema = new Schema<IItemImage>({
    itemId: {
        type: Schema.Types.ObjectId,
        ref: 'Item',
        required: true,
    },
});

// Product Image Schema
interface IProductImage extends IImage {
    productId: Types.ObjectId;
    isMain: boolean;
    isThumbnail?: boolean;
}
const productImageSchema = new Schema<IProductImage>({
    productId: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true,
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    isThumbnail: {
        type: Boolean,
        default: false,
    },
});

interface IBannerImage extends IImage {
    redirectUrl: string;
    isMain: boolean;
    deviceType: 'desktop' | 'mobile' | 'both';
    rotationOrder: number;
    isActive: boolean;
}

const bannerImageSchema = new Schema<IBannerImage>({
    redirectUrl: {
        type: String,
        required: true,
    },
    isMain: {
        type: Boolean,
        default: false,
    },
    deviceType: {
        type: String,
        enum: ['desktop', 'mobile', 'both'],
        default: 'both',
        required: true,
    },
    rotationOrder: {
        type: Number,
        required: true,
        default: 0,
    },
    isActive: {
        type: Boolean,
        default: true,
    }
});

if (mongoose.models.Image) {
    delete mongoose.models.Image;
}
export const Image = model<IImage>("Image", imageSchema);

if (mongoose.models.promotional) {
    delete mongoose.models.promotional;
}
export const PromotionalImage = Image.discriminator<IPromotionalImage>("promotional", promotionalImageSchema);

if (mongoose.models.item) {
    delete mongoose.models.item;
}
export const ItemImage = Image.discriminator<IItemImage>("item", itemImageSchema);

if (mongoose.models.product) {
    delete mongoose.models.product;
}
export const ProductImage = Image.discriminator<IProductImage>("product", productImageSchema);

if (mongoose.models.banner) {
    delete mongoose.models.banner;
}
export const BannerImage = Image.discriminator<IBannerImage>("banner", bannerImageSchema);

export default Image;