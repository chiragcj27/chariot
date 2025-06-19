import mongoose, { model, Schema, Types } from 'mongoose';
import { ItemImage } from './image.model';

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
        ref: 'Image'
    },
    description: {
        type: String,
    },
    subCategoryId: {
        type: Schema.Types.ObjectId,
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

if (mongoose.models.Menu) {
    delete mongoose.models.Menu;
}
export const Menu = model<ICategory>('Menu', categorySchema);

if (mongoose.models.SubCategory) {
    delete mongoose.models.SubCategory;
}
export const SubCategory = model<ISubCategory>('SubCategory', subCategorySchema);

if (mongoose.models.Item) {
    delete mongoose.models.Item;
}
export const Item = model<IItem>('Item', itemSchema);