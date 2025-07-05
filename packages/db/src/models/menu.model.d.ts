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
    categoryId: Types.ObjectId;
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

declare const Menu: mongoose.Model<ICategory, {}, {}, {}, mongoose.Document<unknown, {}, ICategory, {}> & ICategory & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;

declare const Item: mongoose.Model<IItem, {}, {}, {}, mongoose.Document<unknown, {}, IItem, {}> & IItem & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;

export { Menu, Item };
