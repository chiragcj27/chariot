import { Types } from 'mongoose';
import mongoose from 'mongoose';
export type UserRole = 'admin' | 'buyer' | 'seller';
export interface IUser extends Document {
    email: string;
    name: string;
    role: UserRole;
    password: string;
    refreshToken: string;
    createdAt: Date;
    updatedAt: Date;
}
export declare const User: mongoose.Model<IUser, {}, {}, {}, mongoose.Document<unknown, {}, IUser, {}> & IUser & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export interface ISeller extends Document {
    email: string;
    name: string;
    role: UserRole;
    password: string;
    refreshToken: string;
    approvalStatus: 'pending' | 'approved' | 'rejected';
    approvedAt?: Date;
    approvedBy?: Types.ObjectId;
    rejectionReason?: string;
    rejectedAt?: Date;
    rejectedBy?: Types.ObjectId;
    createdAt: Date;
    updatedAt: Date;
    storeDetails: {
        name: string;
        description: string;
        address: string;
        phone: string;
        email: string;
    };
    products: Types.ObjectId[];
    orders: Types.ObjectId[];
    sales: Types.ObjectId[];
    commissionRate: number;
    isBlacklisted: boolean;
    blacklistReason?: string;
    blacklistedAt?: Date;
    blacklistedBy?: Types.ObjectId;
    blacklistExpiryDate?: Date;
    reapplicationDate?: Date;
    reapplicationReason?: string;
}
export declare const Seller: mongoose.Model<ISeller, {}, {}, {}, mongoose.Document<unknown, {}, ISeller, {}> & ISeller & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
export interface IAdmin extends IUser {
    isSuperAdmin: boolean;
}
export declare const Admin: mongoose.Model<IAdmin, {}, {}, {}, mongoose.Document<unknown, {}, IAdmin, {}> & IAdmin & {
    _id: Types.ObjectId;
} & {
    __v: number;
}, any>;
