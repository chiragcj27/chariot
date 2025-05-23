"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const imageSchema = new mongoose_1.Schema({
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
    },
});
const Image = (0, mongoose_1.model)("Image", imageSchema);
exports.default = Image;
