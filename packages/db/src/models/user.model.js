"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.User = void 0;
const mongoose_1 = require("mongoose");
const userSchema = new mongoose_1.Schema({
    email: {
        type: String,
        required: true,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        enum: ['admin', 'buyer', 'seller'],
        default: 'buyer',
    },
    password: {
        type: String,
        required: true,
    },
    refreshToken: {
        type: String,
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
    discriminatorKey: 'role',
    timestamps: true,
});
exports.User = (0, mongoose_1.model)('User', userSchema);
