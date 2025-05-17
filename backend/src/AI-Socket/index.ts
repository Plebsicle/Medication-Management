import { Server, Socket } from 'socket.io';
import jwt from 'jsonwebtoken';
import prisma from '../database';
import { processMedicalQuery } from '../_utilities/chatbot';
import { incrementAiPromptCount } from '../middlewares/aiLimitMiddleware';

const MAX_AI_PROMPTS = 10;

export function configureSocket(io: Server) {
  io.on('connection', (socket: Socket) => {
    console.log('A user connected:', socket.id);

    socket.on('authenticate', (token) => {
      try {
        token = token.replace(/^"|"$/g, '');
        if (!token) {
          socket.emit('error', 'No authentication token provided');
          return;
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
        socket.data.userId = decoded.userId;
        console.log('User authenticated with ID:', decoded.userId);

        socket.emit('authenticated', { success: true });
      } catch (error) {
        console.error('Authentication failed:', error);
        socket.emit('error', 'Authentication failed');
      }
    });

    socket.on('chat message', async (message) => {
      try {
        if (!socket.data?.userId) {
          socket.emit('error', 'Authentication required');
          return;
        }

        const userId = socket.data.userId;

        const rawUser = await prisma.$queryRaw`
          SELECT ai_prompts_count FROM "user" WHERE id = ${userId}
        ` as { ai_prompts_count: number }[];

        if (!rawUser || rawUser.length === 0) {
          socket.emit('error', 'User not found');
          return;
        }

        if (rawUser[0].ai_prompts_count >= MAX_AI_PROMPTS) {
          socket.emit('limit reached', {
            error: 'AI prompt limit reached',
            message: 'You have reached your limit of 10 AI prompts. Please contact support for more information.'
          });
          return;
        }

        console.log(`Processing message from user ${userId}: ${message}`);
        const response = await processMedicalQuery(userId, message);

        await incrementAiPromptCount(userId);

        socket.emit('chat response', response);
      } catch (error) {
        console.error('Error processing message:', error);
        socket.emit('error', 'Failed to process message');
      }
    });

    socket.on('disconnect', () => {
      console.log('User disconnected:', socket.id);
    });

    socket.on('error', (error) => {
      console.error('Socket error:', error);
    });
  });
}
