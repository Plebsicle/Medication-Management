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
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const signup_1 = __importDefault(require("./routes/signup"));
const signin_1 = __importDefault(require("./routes/signin"));
const emailVerification_1 = __importDefault(require("./routes/emailVerification"));
const isverified_1 = __importDefault(require("./routes/isverified"));
const manualEmail_1 = __importDefault(require("./routes/manualEmail"));
const addMedication_1 = __importDefault(require("./routes/addMedication"));
const verifyToken_1 = __importDefault(require("./routes/verifyToken"));
const toggleNotification_1 = __importDefault(require("./routes/toggleNotification"));
const deleteMedication_1 = __importDefault(require("./routes/deleteMedication"));
const medicationHistory_1 = __importDefault(require("./routes/medicationHistory"));
const serveProfile_1 = __importDefault(require("./routes/serveProfile"));
const profilePhoto_1 = __importDefault(require("./routes/profilePhoto"));
const path_1 = __importDefault(require("path"));
const hospitalLocation_1 = __importDefault(require("./routes/hospitalLocation"));
const healthRecords_1 = __importDefault(require("./routes/healthRecords"));
const medicationDetails_1 = __importDefault(require("./routes/medicationDetails"));
const medicationChanges_1 = __importDefault(require("./routes/medicationChanges"));
const forgetPassword_1 = __importDefault(require("./routes/forgetPassword"));
const chatbot_1 = __importDefault(require("./routes/chatbot"));
const schedule_1 = __importDefault(require("./_utilities/schedule"));
const chatbot_2 = require("./_utilities/chatbot");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "*",
        methods: ["GET", "POST"]
    }
});
app.use((0, cors_1.default)());
app.use(express_1.default.json());
// Socket.IO handler for chatbot
io.on('connection', (socket) => {
    console.log('A user connected:', socket.id);
    socket.on('authenticate', (token) => {
        try {
            console.log(token);
            token = token.replace(/^"|"$/g, '');
            if (!token) {
                socket.emit('error', 'No authentication token provided');
                return;
            }
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            socket.data.userId = decoded.userId;
            console.log('User authenticated with ID:', decoded.userId);
            // Explicitly acknowledge successful authentication
            socket.emit('authenticated', { success: true });
        }
        catch (error) {
            console.error('Authentication failed:', error);
            socket.emit('error', 'Authentication failed');
        }
    });
    socket.on('chat message', (message) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            if (!socket.data || !socket.data.userId) {
                socket.emit('error', 'Authentication required');
                return;
            }
            console.log(`Processing message from user ${socket.data.userId}: ${message}`);
            const response = yield (0, chatbot_2.processMedicalQuery)(socket.data.userId, message);
            socket.emit('chat response', response);
        }
        catch (error) {
            console.error('Error processing message:', error);
            socket.emit('error', 'Failed to process message');
        }
    }));
    socket.on('disconnect', () => {
        console.log('User disconnected:', socket.id);
    });
    // Handle errors
    socket.on('error', (error) => {
        console.error('Socket error:', error);
    });
});
app.use('/signup', signup_1.default);
app.use('/signin', signin_1.default);
app.use('/verifyEmail', emailVerification_1.default);
app.use('/isverified', isverified_1.default);
app.use('/manualEmail', manualEmail_1.default);
app.use('/addMedication', addMedication_1.default);
app.use('/verifyToken', verifyToken_1.default);
app.use('/toggleNotification', toggleNotification_1.default);
app.use('/deleteMedication', deleteMedication_1.default);
app.use('/medicationHistory', medicationHistory_1.default);
app.use('/serveProfile', serveProfile_1.default);
app.use('/profilePhoto', profilePhoto_1.default);
app.use('/hospitalLocation', hospitalLocation_1.default);
app.use('/healthRecords', healthRecords_1.default);
app.use('/medications', medicationDetails_1.default);
app.use('/editMedications', medicationChanges_1.default);
app.use('/forgetPassword', forgetPassword_1.default);
app.use('/chatbot', chatbot_1.default);
(0, schedule_1.default)();
app.use('/uploads', express_1.default.static(path_1.default.join(__dirname, 'uploads')));
const PORT = 8000;
server.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
