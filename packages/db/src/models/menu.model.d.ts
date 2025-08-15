import mongoose, { Types } from 'mongoose';
export interface IItem {
    _id?: Types.ObjectId;
    title: string;
    slug: string;
    image?: Types.ObjectId;
    onHover?: Types.ObjectId;
    description?: string;
    categoryId: Types.ObjectId;
    filters?: Array<{
        id: string;
        name: string;
        values: Array<{
            id: string;
            name: string;
            value: string;
        }>;
    }>;
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
