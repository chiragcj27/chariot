import mongoose, { model, Schema } from 'mongoose';

interface IMenuItem extends Document {
    title: string;
    slug: string;
    parentId: mongoose.Schema.Types.ObjectId;
    pageId: mongoose.Schema.Types.ObjectId;
    filters: string[];
}
const menuItemSchema = new Schema<IMenuItem>({
    title : {
        type: String,
        required: true,
    },
    slug: {
        type: String,
        required: true,
    },
    parentId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'MenuItem',
    },
    pageId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Page',
        default: null,
    },
    filters: [String],
});

export const MenuItem = model<IMenuItem>('MenuItem', menuItemSchema);