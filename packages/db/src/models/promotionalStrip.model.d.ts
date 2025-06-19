import mongoose from "mongoose";
interface IPromotionalStrip {
    stripContent: string;
    stripLink: string;
}
export declare const PromotionalStrip: mongoose.Model<IPromotionalStrip, {}, {}, {}, mongoose.Document<unknown, {}, IPromotionalStrip, {}> & IPromotionalStrip & {
    _id: mongoose.Types.ObjectId;
} & {
    __v: number;
}, any>;
export {};
