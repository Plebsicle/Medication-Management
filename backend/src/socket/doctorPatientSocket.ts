import { Server, Socket } from 'socket.io';
import { PrismaClient } from '@prisma/client';
import jwt from 'jsonwebtoken';

const prisma = new PrismaClient();

interface JwtPayload {
  userId?: number;
  id?: number;
  sub?: number;
  name?: string;
  email?: string;
  role?: string;
  exp?: number;
  iat?: number;
}

/**
 * Configure Socket.IO for doctor-patient chat
 * @param io - Socket.IO server instance
 */

export const configureDoctorPatientSocket = (io: Server): void => {
  // JWT Authentication middleware
  io.use(async (socket, next) => {
    try {
      const token = socket.handshake.auth?.token;
      
      if (!token) {
        return next(new Error('Authentication error: Token not provided'));
      }
      
      // Decode token and verify
      const secret = process.env.JWT_SECRET || 'your_jwt_secret';
      const decoded = jwt.verify(token, secret) as JwtPayload;
      
      if (!decoded) {
        return next(new Error('Authentication error: Invalid token'));
      }
      
      // Get user ID from token
      const userId = decoded.userId || decoded.id || decoded.sub;
      
      if (!userId) {
        return next(new Error('Authentication error: User ID not found in token'));
      }
      
      // Attach user ID to socket
      socket.data.userId = userId;
      socket.data.userRole = decoded.role;
      
      return next();
    } catch (error) {
      console.error('Socket authentication error:', error);
      return next(new Error('Authentication error'));
    }
  });

  io.on('connection', (socket: Socket) => {
    console.log('User connected:', socket.id, 'User ID:', socket.data.userId);

    // Join a chat room
    socket.on('join', async (chatId: number | string) => {
      // Verify the user has access to this chat
      try {
        const chat = await prisma.doctor_patient_chat.findUnique({
          where: {
            chat_id: Number(chatId),
          }
        });
        
        if (!chat) {
          socket.emit('error', { message: 'Chat not found' });
          return;
        }
        
        // Check if user is part of this chat
        if (chat.doctor_id !== socket.data.userId && chat.patient_id !== socket.data.userId) {
          socket.emit('error', { message: 'Not authorized to join this chat' });
          return;
        }
        
        socket.join(chatId.toString());
        console.log(`Socket ${socket.id} joined room ${chatId}`);
      } catch (error) {
        console.error(`Error joining chat ${chatId}:`, error);
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    // Leave a chat room
    socket.on('leave', (chatId: number | string) => {
      socket.leave(chatId.toString());
      console.log(`Socket ${socket.id} left room ${chatId}`);
    });

    // Handle new message
    socket.on('message:send', async (data: { chatId: number | string; content: string }) => {
      try {
        const { chatId, content } = data;
        const senderId = socket.data.userId; // Use the verified user ID from the socket
        
        if (!senderId) {
          console.error('Error: Missing senderId for message');
          socket.emit('message:error', { error: 'Missing user ID' });
          return;
        }
        
        // Verify the user has access to this chat
        const chat = await prisma.doctor_patient_chat.findUnique({
          where: {
            chat_id: Number(chatId),
          }
        });
        
        if (!chat) {
          socket.emit('message:error', { error: 'Chat not found' });
          return;
        }
        
        // Check if user is part of this chat
        if (chat.doctor_id !== senderId && chat.patient_id !== senderId) {
          socket.emit('message:error', { error: 'Not authorized to send messages in this chat' });
          return;
        }
        
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
        socket.emit('message:error', { error: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });
  });
}; 