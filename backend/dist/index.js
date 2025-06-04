"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv = __importStar(require("dotenv"));
dotenv.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const signup_1 = __importDefault(require("./routes/auth/signup"));
const signin_1 = __importDefault(require("./routes/auth/signin"));
const email_1 = __importDefault(require("./routes/email/email"));
const manualEmail_1 = __importDefault(require("./routes/user/manualEmail"));
const postMedication_1 = __importDefault(require("./routes/medication/postMedication"));
const verifyToken_1 = __importDefault(require("./routes/user/verifyToken"));
const toggleNotification_1 = __importDefault(require("./routes/user/toggleNotification"));
const postMedication_2 = __importDefault(require("./routes/medication/postMedication"));
const medicationHistory_1 = __importDefault(require("./routes/medication/medicationHistory"));
const serveProfile_1 = __importDefault(require("./routes/user/serveProfile"));
const profilePhoto_1 = __importDefault(require("./routes/user/profilePhoto"));
const hospitalLocation_1 = __importDefault(require("./routes/miscellanous/hospitalLocation"));
const healthRecords_1 = __importDefault(require("./routes/health/healthRecords"));
const medicationDetails_1 = __importDefault(require("./routes/medication/medicationDetails"));
const medicationChanges_1 = __importDefault(require("./routes/medication/medicationChanges"));
const forgetPassword_1 = __importDefault(require("./routes/user/forgetPassword"));
const chatbot_1 = __importDefault(require("./routes/chat/chatbot"));
const doctorPatientChat_1 = __importDefault(require("./routes/chat/doctorPatientChat"));
const medicalDocuments_1 = __importDefault(require("./routes/health/medicalDocuments"));
const fileRoutes_1 = __importDefault(require("./routes/fileRoutes"));
const schedule_1 = __importDefault(require("./_utilities/schedule"));
const AI_Socket_1 = require("./AI-Socket");
const socket_1 = require("./socket");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
app.use((req, res, next) => {
    // Explicitly disable Cross-Origin-Opener-Policy
    res.removeHeader('Cross-Origin-Opener-Policy');
    res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
    const originalSetHeader = res.setHeader;
    res.setHeader = function (name, value) {
        if (name.toLowerCase() === 'cross-origin-opener-policy') {
            return originalSetHeader.call(this, name, 'unsafe-none');
        }
        return originalSetHeader.call(this, name, value);
    };
    next();
});
const allowedOrigins = [
    'https://plebsicle.me',
    'http://localhost:5173',
];
app.use((0, cors_1.default)({
    origin: (origin, callback) => {
        if (!origin)
            return callback(null, true);
        if (allowedOrigins.includes(origin)) {
            return callback(null, true);
        }
        else {
            return callback(new Error('CORS not allowed from this origin'));
        }
    },
    credentials: true
}));
// Add Cross-Origin-Opener-Policy header after cors middleware
const io = new socket_io_1.Server(server, {
    cors: {
        origin: allowedOrigins,
        methods: ["GET", "POST"],
        credentials: true
    }
});
// Configure AI Socket
(0, AI_Socket_1.configureSocket)(io);
// Configure doctor-patient chat socket
(0, socket_1.configureSocketHandlers)(io);
app.use(express_1.default.json());
app.use('/signup', signup_1.default);
app.use('/signin', signin_1.default);
app.use('/verifyEmail', email_1.default);
app.use('/manualEmail', manualEmail_1.default);
app.use('/addMedication', postMedication_1.default);
app.use('/verifyToken', verifyToken_1.default);
app.use('/toggleNotification', toggleNotification_1.default);
app.use('/deleteMedication', postMedication_2.default);
app.use('/medicationHistory', medicationHistory_1.default);
app.use('/serveProfile', serveProfile_1.default);
app.use('/profilePhoto', profilePhoto_1.default);
app.use('/hospitalLocation', hospitalLocation_1.default);
app.use('/healthRecords', healthRecords_1.default);
app.use('/medications', medicationDetails_1.default);
app.use('/editMedications', medicationChanges_1.default);
app.use('/forgetPassword', forgetPassword_1.default);
app.use('/chatbot', chatbot_1.default);
app.use('/chats', doctorPatientChat_1.default);
app.use('/medicalDocuments', medicalDocuments_1.default);
app.use('/files', fileRoutes_1.default);
(0, schedule_1.default)();
const PORT = 8000;
server.listen(PORT, '0.0.0.0', () => {
    console.log(`Server is running on port ${PORT}`);
});
