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
exports.processMedicalQuery = processMedicalQuery;
exports.getChatHistory = getChatHistory;
const openai_1 = __importDefault(require("openai"));
const database_1 = __importDefault(require("../database"));
// Define fallback responses for when OpenAI is not available
const fallbackResponses = [
    "I understand you may have concerns about your symptoms. For personalized medical advice, please consult with a healthcare professional.",
    "Based on general information, symptoms like these could have multiple causes. It's best to consult with a doctor for proper diagnosis.",
    "Your health is important. While I can provide general information, a healthcare provider can give you personalized advice based on your medical history.",
    "I'm a basic AI assistant and can only provide general information. Please consult with a qualified healthcare professional for medical advice.",
    "Thank you for your question. For accurate diagnosis and treatment, it's important to consult with a healthcare provider who can examine you in person."
];
// Initialize OpenAI with API key from environment variable
let openai = null;
try {
    openai = new openai_1.default({
        apiKey: process.env.OPENAI_API_KEY,
    });
}
catch (error) {
    console.error('Failed to initialize OpenAI client:', error);
}
// Get a random fallback response
function getFallbackResponse() {
    const randomIndex = Math.floor(Math.random() * fallbackResponses.length);
    return fallbackResponses[randomIndex];
}
function processMedicalQuery(userId, query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a, _b;
        try {
            let aiResponse = '';
            // Try to use OpenAI if available
            if (openai) {
                try {
                    // Create a system message to set the context for the AI
                    const systemMessage = `
        You are a basic medical assistant that can help with simple medical questions. 
        You should only answer general medical questions about symptoms, common conditions, and general health advice.
        Always remind the user that you are not a replacement for professional medical advice.
        If the question is outside the scope of basic medical assistance, politely decline to answer and suggest consulting with a healthcare professional.
        Always be factual and avoid speculative diagnoses.
        `;
                    // Call the OpenAI API
                    const response = yield openai.chat.completions.create({
                        model: 'gpt-3.5-turbo',
                        messages: [
                            { role: 'system', content: systemMessage },
                            { role: 'user', content: query }
                        ],
                        temperature: 0.7,
                        max_tokens: 500,
                    });
                    // Get the AI response
                    aiResponse = ((_b = (_a = response.choices[0]) === null || _a === void 0 ? void 0 : _a.message) === null || _b === void 0 ? void 0 : _b.content) || getFallbackResponse();
                }
                catch (error) {
                    console.error('Error calling OpenAI API:', error);
                    aiResponse = getFallbackResponse();
                }
            }
            else {
                console.warn('OpenAI client not initialized. Using fallback response.');
                aiResponse = getFallbackResponse();
            }
            // Try to store the conversation in the database
            try {
                yield database_1.default.chat_message.create({
                    data: {
                        user_id: userId,
                        content: query,
                        is_ai: false,
                    },
                });
                yield database_1.default.chat_message.create({
                    data: {
                        user_id: userId,
                        content: aiResponse,
                        is_ai: true,
                    },
                });
            }
            catch (dbError) {
                console.error('Error storing messages in database:', dbError);
                // Continue even if database storage fails
            }
            return aiResponse;
        }
        catch (error) {
            console.error('Error processing medical query:', error);
            return 'Sorry, I encountered an error processing your request. Please try again later.';
        }
    });
}
function getChatHistory(userId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            return yield database_1.default.chat_message.findMany({
                where: {
                    user_id: userId,
                },
                orderBy: {
                    created_at: 'asc',
                },
            });
        }
        catch (error) {
            console.error('Error fetching chat history:', error);
            return [];
        }
    });
}
