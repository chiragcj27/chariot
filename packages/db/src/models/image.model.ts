import { model, Schema } from "mongoose";

interface IImage extends Document {
    filename: string;
    originalname: string;
    url: string;
    size: number;
    createdAt: Date;
    updatedAt: Date;
}

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
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    }
});

const Image = model<IImage>("Image", imageSchema);

export default Image;