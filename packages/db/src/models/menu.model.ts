import mongoose, { model, Schema, Types } from 'mongoose';
import { ItemImage } from './image.model';

interface IItem {
    id: string;
    title: string;
    slug: string;
    image: Types.ObjectId;
    description: string;
    subCategoryId: string;
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
        required: true,
        ref: 'ItemImage'
    },
    description: {
        type: String,
    },
    subCategoryId: {
        type: String,
        required: true,
        ref: 'SubCategory'
    }
});

const subCategorySchema = new mongoose.Schema<ISubCategory>({
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    description: {
        type: String,
        required: true,
    },
    categoryId: {
        type: String,
        required: true,
        ref: 'Category'
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

export const Menu = model<ICategory>('Menu', categorySchema);
export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);
export const Item = model<IItem>('Item', itemSchema);