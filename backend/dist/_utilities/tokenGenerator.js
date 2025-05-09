"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = tokenGenerator;
const crypto_1 = __importDefault(require("crypto"));
function tokenGenerator() {
    return crypto_1.default.randomBytes(32).toString('hex');
}
