"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.hello = exports.User = exports.connectDB = void 0;
// Main entry point for the database package
const database_1 = __importDefault(require("./config/database"));
exports.connectDB = database_1.default;
const user_model_1 = require("./models/user.model");
Object.defineProperty(exports, "User", { enumerable: true, get: function () { return user_model_1.User; } });
const hello = () => {
    return 'Hello from db package!';
};
exports.hello = hello;
