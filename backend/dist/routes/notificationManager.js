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
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const client_1 = require("@prisma/client");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: {
        origin: "http://localhost:5173",
        methods: ["GET", "POST"],
    },
});
const prisma = new client_1.PrismaClient();
io.on("connection", (socket) => {
    console.log("New client connected:", socket.id);
    socket.on("authenticate", (token) => __awaiter(void 0, void 0, void 0, function* () {
        try {
            console.log(token);
            const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET);
            const email = decoded.email;
            if (!email) {
                socket.emit("error", "Invalid token. Email not found.");
                return;
            }
            const user = yield prisma.user.findFirst({ where: { email } });
            if (!user) {
                socket.emit("error", "User not found.");
                return;
            }
            console.log(`User ${email} authenticated.`);
            socket.join(user.id.toString());
        }
        catch (error) {
            socket.emit("error", "Authentication failed.");
        }
    }));
    socket.on("disconnect", () => {
        console.log("Client disconnected:", socket.id);
    });
});
setInterval(() => __awaiter(void 0, void 0, void 0, function* () {
    const now = new Date();
    try {
        const medications = yield prisma.medication.findMany({
            include: { medication_times: true, user: true },
        });
        medications.forEach((medication) => {
            const { user_id, name, start_date, end_date, medication_times } = medication;
            if (start_date <= now && end_date >= now) {
                medication_times.forEach((time) => {
                    const intakeTime = new Date(time.intake_time);
                    const hour = intakeTime.getHours();
                    const minute = intakeTime.getMinutes();
                    const medicationTime = new Date();
                    medicationTime.setHours(hour, minute, 0);
                    if (Math.abs(medicationTime.getTime() - now.getTime()) <= 60000) {
                        io.to(user_id.toString()).emit("notification", {
                            title: "Medication Reminder",
                            body: `It's time to take your medication: ${name}`,
                        });
                    }
                });
            }
        });
    }
    catch (error) {
        console.error("Error processing notifications:", error);
    }
}), 60000);
server.listen(8001, () => {
    console.log("Server is running on http://localhost:8001");
});
