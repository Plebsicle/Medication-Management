import express from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { getChatHistory } from '../_utilities/chatbot';

const router = express.Router();

// Define validation schema
const ChatHistorySchema = z.object({
  token: z.string(),
});

// Get chat history
router.post('/history', async (req, res) => {
  try {
    // Validate the request
    console.log(req.body);
    const validatedData = ChatHistorySchema.parse(req.body);
    const token = validatedData.token.replace(/^"|"$/g, '');
    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
    
    // Get the user's chat history
    const chatHistory = await getChatHistory(decoded.userId);
    
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
});

export default router; 