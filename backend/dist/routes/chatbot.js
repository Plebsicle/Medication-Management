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
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const zod_1 = require("zod");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const chatbot_1 = require("../_utilities/chatbot");
const router = express_1.default.Router();
// Define validation schema
const ChatHistorySchema = zod_1.z.object({
    token: zod_1.z.string(),
});
// Get chat history
router.post('/history', (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        // Validate the request
        console.log(req.body);
        const validatedData = ChatHistorySchema.parse(req.body);
        const token = validatedData.token.replace(/^"|"$/g, '');
        // Verify token
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
        // Get the user's chat history
        const chatHistory = yield (0, chatbot_1.getChatHistory)(decoded.userId);
        res.status(200).json({
            success: true,
            message: 'Chat history retrieved successfully',
            data: chatHistory,
        });
    }
    catch (error) {
        console.error('Error retrieving chat history:', error);
        res.status(400).json({
            success: false,
            message: 'Failed to retrieve chat history',
            error: error instanceof Error ? error.message : 'Unknown error',
        });
    }
}));
exports.default = router;
