import mongoose, { Document, Types } from "mongoose";
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
    imageType: string;
}
interface IPromotionalImage extends IImage {
    redirectUrl: string;
}
export interface IItemImage extends IImage {
    itemId: Types.ObjectId;
}
interface IProductImage extends IImage {
    productId: Types.ObjectId;
    isMain: boolean;
    isThumbnail?: boolean;
}
interface IBannerImage extends IImage {
    redirectUrl: string;
    isMain: boolean;
    deviceType: 'desktop' | 'mobile' | 'both';
    rotationOrder: number;
    isActive: boolean;
}
export declare const Image: mongoose.Model<IImage, {}, {}, {}, mongoose.Document<unknown, {}, IImage, {}> & IImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const PromotionalImage: mongoose.Model<IPromotionalImage, {}, {}, {}, mongoose.Document<unknown, {}, IPromotionalImage, {}> & IPromotionalImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const ItemImage: mongoose.Model<IItemImage, {}, {}, {}, mongoose.Document<unknown, {}, IItemImage, {}> & IItemImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const ProductImage: mongoose.Model<IProductImage, {}, {}, {}, mongoose.Document<unknown, {}, IProductImage, {}> & IProductImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export declare const BannerImage: mongoose.Model<IBannerImage, {}, {}, {}, mongoose.Document<unknown, {}, IBannerImage, {}> & IBannerImage & Required<{
    _id: unknown;
}> & {
    __v: number;
}, any>;
export default Image;
