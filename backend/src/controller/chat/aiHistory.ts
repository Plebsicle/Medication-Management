import {Request,Response} from 'express'
import prisma from '../../database';
import jwt from 'jsonwebtoken'; 
import z from 'zod'
import { getChatHistory } from '../../_utilities/chatbot';

// Define validation schema
const ChatHistorySchema = z.object({
  token: z.string(),
});

export const AIHistory = async (req : Request, res : Response): Promise<void> => {
  try {
    // console.log(req.body);
    const validatedData = ChatHistorySchema.parse(req.body);
    // Verify token
    let userId = req.userId;
    if(!userId) return;
    // userId = parseInt(userId);
    // Get the user's chat history
    const chatHistory = await getChatHistory(userId);
    
    res.status(200).json({
      success: true,
      message: 'Chat history retrieved successfully',
      data: chatHistory,
    });
    
  } catch (error) {
    console.error('Error retrieving chat history:', error);
    res.status(400).json({
      success: false,
      message: 'Failed to retrieve chat history',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
}