"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
const index_1 = require("./index");
function testConnection() {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            // Test the hello function
            console.log((0, index_1.hello)());
            // Test database connection
            yield (0, index_1.connectDB)();
            // If we get here, the connection was successful
            console.log('All tests passed successfully!');
            process.exit(0);
        }
        catch (error) {
            console.error('Test failed:', error);
            process.exit(1);
        }
    });
}
testConnection();
