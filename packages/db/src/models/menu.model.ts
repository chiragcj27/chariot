import mongoose, { model, Schema } from 'mongoose';

interface IItem {
    id: string;
    title: string;
    slug: string;
}
interface ISubCategory {
    id: string;
    title: string;
    slug: string;
    items: IItem[];
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
    subCategories: ISubCategory[];
    featuredItems: IFeaturedItem[];
}
const itemSchema = new mongoose.Schema<IItem>({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
},{_id: false});

const subCategorySchema = new mongoose.Schema<ISubCategory>({
    id: {
        type: String,
        required: true,
    },
    title: {
        type: String,
        required: true,
    },
    items: {
        type: [itemSchema],
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
}, { _id: false });

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
    subCategories: {
        type: [subCategorySchema],
        required: true,
    },
    featuredItems: {
        type: [featuredItemSchema],
        required: true,
    },
});

export const Menu = model<ICategory>('Menu', categorySchema);