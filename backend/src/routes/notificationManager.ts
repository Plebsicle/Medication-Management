import express from "express";
import http from "http";
import { Server as SocketIOServer } from "socket.io";
import { PrismaClient } from "@prisma/client";
import jwt from "jsonwebtoken";

const app = express();
const server = http.createServer(app);
const io = new SocketIOServer(server, {
  cors: {
    origin: "http://localhost:5173", 
    methods: ["GET", "POST"],
  },
});

const prisma = new PrismaClient();

io.on("connection", (socket) => {
  console.log("New client connected:", socket.id);

  socket.on("authenticate", async (token: string) => {
    try {
      
      console.log(token);
      const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
      const email = decoded.email;

      if (!email) {
        socket.emit("error", "Invalid token. Email not found.");
        return;
      }

      const user = await prisma.user.findFirst({ where: { email } });
      if (!user) {
        socket.emit("error", "User not found.");
        return;
      }

      console.log(`User ${email} authenticated.`);
      socket.join(user.id.toString()); 
    } catch (error) {
      socket.emit("error", "Authentication failed.");
    }
  });

  socket.on("disconnect", () => {
    console.log("Client disconnected:", socket.id);
  });
});

setInterval(async () => {
  const now = new Date();

  try {
    const medications = await prisma.medication.findMany({
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
  } catch (error) {
    console.error("Error processing notifications:", error);
  }
}, 60000); 

server.listen(8001, () => {
  console.log("Server is running on http://localhost:8001");
});
