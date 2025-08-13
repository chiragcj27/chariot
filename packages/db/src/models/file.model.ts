import mongoose, { model, Schema, Document, Types } from "mongoose";

// Base file interface
export interface IFile extends Document {
    filename: string;
    originalname: string;
    url: string;
    size: number;
    mimetype: string;
    bucket?: string;
    status: 'pending' | 'uploaded' | 'failed';
    metadata?: Record<string, any>;
    createdAt: Date;
    updatedAt: Date;
    fileType: string;
}

// Base file schema
const fileSchema = new Schema<IFile>({
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
    mimetype: {
        type: String,
        required: true,
    },
    bucket: {
        type: String,
    },
    status: {
        type: String,
        enum: ['pending', 'uploaded', 'failed'],
        default: 'pending',
    },
    metadata: {
        type: Schema.Types.Mixed,
    },
    fileType: {
        type: String,
        required: true,
        enum: ['pdf', 'document', 'zip', 'other'],
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
}, {
    discriminatorKey: 'fileType',
    timestamps: true,
});

// PDF File Schema
interface IPdfFile extends IFile {
    pageCount?: number;
    isPreview?: boolean;
}

const pdfFileSchema = new Schema<IPdfFile>({
    pageCount: {
        type: Number,
    },
    isPreview: {
        type: Boolean,
        default: false,
    },
});

// Document File Schema
interface IDocumentFile extends IFile {
    documentType: string;
    isPreview?: boolean;
}

const documentFileSchema = new Schema<IDocumentFile>({
    documentType: {
        type: String,
        required: true,
    },
    isPreview: {
        type: Boolean,
        default: false,
    },
});

// ZIP File Schema
interface IZipFile extends IFile {
    containsFiles: number;
    isPreview?: boolean;
}

const zipFileSchema = new Schema<IZipFile>({
    containsFiles: {
        type: Number,
    },
    isPreview: {
        type: Boolean,
        default: false,
    },
});

// Clear existing models if they exist
if (mongoose.models.File) {
    delete mongoose.models.File;
}
export const File = model<IFile>("File", fileSchema);

if (mongoose.models.pdf) {
    delete mongoose.models.pdf;
}
export const PdfFile = File.discriminator<IPdfFile>("pdf", pdfFileSchema);

if (mongoose.models.document) {
    delete mongoose.models.document;
}
export const DocumentFile = File.discriminator<IDocumentFile>("document", documentFileSchema);

if (mongoose.models.zip) {
    delete mongoose.models.zip;
}
export const ZipFile = File.discriminator<IZipFile>("zip", zipFileSchema);

export default File; 