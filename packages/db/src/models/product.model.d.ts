import mongoose, { Types } from "mongoose";
export declare enum ProductType {
    PHYSICAL = "physical",
    DIGITAL = "digital",
    SERVICE = "service"
}
export declare enum ProductStatus {
    ACTIVE = "active",
    INACTIVE = "inactive",
    DRAFT = "draft",
    ARCHIVED = "archived",
    DELETED = "deleted",
    PENDING = "pending",
    REJECTED = "rejected"
}
export interface IProduct {
    name: string;
    description: string;
    categoryId?: Types.ObjectId; // Made optional
    itemId?: Types.ObjectId; // Made optional
    type: ProductType;
    isKitProduct: boolean;
    kitId?: Types.ObjectId; // Made optional
    typeOfKit?: 'premium' | 'basic'; // Made optional
    price?: {
        amount: number;
        currency: string;
    };
    creditsCost?: number;
    discountedCreditsCost?: number;
    discount?: {
        percentage: number;
    };
    theme?: string;
    season?: string;
    occasion?: string;
    tags: string[];
    featured: boolean;
    status: ProductStatus;
    createdAt: Date;
    updatedAt: Date;
    images: Types.ObjectId[];
    seo?: {
        metaTitle: string;
        metaDescription: string;
        metaKeywords: string[];
    };
    slug: string;
    isAdminApproved: boolean;
    isAdminRejected: boolean;
    adminRejectionReason: string;
    adminApprovedAt: Date;
    adminRejectedAt: Date;
    sellerId: Types.ObjectId;
    relatedProductsId: Types.ObjectId[];
}
export declare const Product: mongoose.Model<IProduct, {}, {}, {}, mongoose.Document<unknown, {}, IProduct, {}> & IProduct & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
interface IPhysicalProduct extends IProduct {
    dimensions?: {
        length: number;
        width: number;
        height: number;
        unit: string;
    };
    weight?: {
        value: number;
        unit: string;
    };
    stock: number;
}
export declare const PhysicalProduct: mongoose.Model<IPhysicalProduct, {}, {}, {}, mongoose.Document<unknown, {}, IPhysicalProduct, {}> & IPhysicalProduct & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
interface IDigitalProduct extends IProduct {
    kind: string;
    zipFile?: {
        name: string;
        url: string;
        key: string;
        size: number;
    };
    previewFile?: {
        name: string;
        url: string;
        key: string;
    };
}
export declare const DigitalProduct: mongoose.Model<IDigitalProduct, {}, {}, {}, mongoose.Document<unknown, {}, IDigitalProduct, {}> & IDigitalProduct & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
interface IServiceProduct extends IProduct {
    deliveryTime: {
        min: number;
        max: number;
        unit: string;
    };
    revisions: {
        allowed: number;
        cost: number;
        unit: string;
    };
    deliverables: string[];
    requirements: string[];
    consultationRequired: boolean;
}
export declare const ServiceProduct: mongoose.Model<IServiceProduct, {}, {}, {}, mongoose.Document<unknown, {}, IServiceProduct, {}> & IServiceProduct & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export {};
