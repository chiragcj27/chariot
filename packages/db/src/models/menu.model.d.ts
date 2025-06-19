import mongoose, { Types } from 'mongoose';
export interface IItem {
    id: string;
    title: string;
    slug: string;
    image: {
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
    };
    description: string;
    subCategoryId: Types.ObjectId;
}
interface ISubCategory {
    id: string;
    title: string;
    slug: string;
    description: string;
    categoryId: string;
}
interface IFeaturedItem {
    id: string;
    title: string;
    price: number;
    image: string;
    slug: string;
}
interface ICategory {
    title: string;
    slug: string;
    featuredItems: IFeaturedItem[];
}
export declare const Menu: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}> & ICategory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const SubCategory: mongoose.Model<ISubCategory, {}, {}, {}, mongoose.Document<unknown, {}, ISubCategory, {}> & ISubCategory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export declare const Item: mongoose.Model<IItem, {}, {}, {}, mongoose.Document<unknown, {}, IItem, {}> & IItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export {};
