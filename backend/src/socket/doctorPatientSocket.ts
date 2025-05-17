import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Configure Socket.IO for doctor-patient chat
 * @param io - Socket.IO server instance
 */
export const configureDoctorPatientSocket = (io: Server): void => {
  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id);

    // Join a chat room
    socket.on('join', (chatId: number | string) => {
      socket.join(chatId.toString());
      console.log(`Socket ${socket.id} joined room ${chatId}`);
    });

    // Leave a chat room
    socket.on('leave', (chatId: number | string) => {
      socket.leave(chatId.toString());
      console.log(`Socket ${socket.id} left room ${chatId}`);
    });

    // Handle new message
    socket.on('message:send', async (data: { chatId: number | string; senderId: number | string; content: string }) => {
      try {
        const { chatId, senderId, content } = data;
        
        // Save message to database
        const message = await prisma.chat_message.create({
          data: {
            chat_id: Number(chatId),
            user_id: Number(senderId),
            content,
          },
          include: {
            user: {
              select: {
                id: true,
                name: true,
                profile_photo_path: true,
                role: true,
              },
            },
          },
        });

        // Update chat's updated_at timestamp
        await prisma.doctor_patient_chat.update({
          where: {
            chat_id: Number(chatId),
          },
          data: {
            updated_at: new Date(),
          },
        });

        // Broadcast message to everyone in the room
        io.to(chatId.toString()).emit('message:receive', message);
      } catch (error) {
        console.error('Error handling message:', error);
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 