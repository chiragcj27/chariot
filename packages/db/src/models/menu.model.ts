import mongoose, { model, Schema, Types } from 'mongoose';
import { ItemImage } from './image.model';

export interface IFilterValue {
    id: string;
    name: string;
    value: string;
}

export interface IFilter {
    id: string;
    name: string;
    values: IFilterValue[];
}

export interface IItem {
    id: string;
    title: string;
    slug: string;
    image?: Types.ObjectId;
    onHover?: Types.ObjectId;
    description: string;
    categoryId: Types.ObjectId;
    filters?: IFilter[];
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

const filterValueSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    value: {
        type: String,
        required: true,
    },
}, { _id: false });

const filterSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    name: {
        type: String,
        required: true,
    },
    values: {
        type: [filterValueSchema],
        required: true,
    },
}, { _id: false });

const itemSchema = new mongoose.Schema<IItem>({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    image: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Image'
    },
    onHover: {
        type: Schema.Types.ObjectId,
        required: false,
        ref: 'Image'
    },
    description: {
        type: String,
    },
    categoryId: {
        type: Schema.Types.ObjectId,
        required: true,
        ref: 'Menu'
    },
    filters: {
        type: [filterSchema],
        required: false,
        default: [],
    }
});

const featuredItemSchema = new mongoose.Schema({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    price: {
        type: Number,
        required: true,
    },
    image: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
}, { _id: false });

const categorySchema = new mongoose.Schema<ICategory>({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    featuredItems: {
        type: [featuredItemSchema],
        required: false,
    },
});

if (mongoose.models.Menu) {
    delete mongoose.models.Menu;
}
export const Menu = model<ICategory>('Menu', categorySchema);

if (mongoose.models.Item) {
    delete mongoose.models.Item;
}
export const Item = model<IItem>('Item', itemSchema);