import { Document, Types } from "mongoose";

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

// PDF File interface
export interface IPdfFile extends IFile {
    pageCount?: number;
    isPreview?: boolean;
}

// Document File interface
export interface IDocumentFile extends IFile {
    documentType: string;
    isPreview?: boolean;
}

// ZIP File interface
export interface IZipFile extends IFile {
    containsFiles: number;
    isPreview?: boolean;
}

export { File, PdfFile, DocumentFile, ZipFile } from "./file.model"; 