"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Admin = void 0;
const mongoose_1 = require("mongoose");
const user_model_1 = require("./user.model");
const adminSchema = new mongoose_1.Schema({
    isSuperAdmin: {
        type: Boolean,
        default: false,
    },
    permissions: {
        type: [String],
        default: [],
    },
});
exports.Admin = user_model_1.User.discriminator("admin", adminSchema);
