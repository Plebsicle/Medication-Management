import express, { Request, Response } from 'express';
import { z } from 'zod';
import jwt from 'jsonwebtoken';
import { getChatHistory } from '../_utilities/chatbot';
import { checkAiLimit, incrementAiPromptCount } from '../_utilities/aiLimitMiddleware';
import prisma from '../database';

const router = express.Router();

// Define validation schema
const ChatHistorySchema = z.object({
  token: z.string(),
});

// Get user's AI usage
router.get('/usage', async (req: Request, res: Response): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    let token = authHeader.split(' ')[1];
    if (token) {
      token = token.replace(/^"|"$/g, '');
    }

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { id: string };
    const userId = parseInt(decoded.id, 10);
    
    // Get the user's AI prompt count using raw query
    const rawUser = await prisma.$queryRaw`SELECT ai_prompts_count FROM "user" WHERE id = ${userId}` as { ai_prompts_count: number }[];
    
    if (!rawUser || rawUser.length === 0) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    
    res.status(200).json({
      success: true,
      aiPromptsCount: rawUser[0].ai_prompts_count || 0
    });
    return;
  } catch (error) {
    console.error('Error fetching AI usage:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
});

// Get chat history - no AI limit for history
router.post('/history', async (req, res): Promise<void> => {
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

// New endpoint for submitting chat messages with AI limit
router.post('/prompt', checkAiLimit, async (req, res): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = (req as any).user.id;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    
    // Process the message (this would connect to your AI service)
    // For demo purposes, we're just echoing back
    const response = `AI response to: ${message}`;
    
    // Increment the user's AI prompt count
    await incrementAiPromptCount(userId);
    
    res.status(200).json({
      success: true,
      message: 'AI response generated successfully',
      data: { response }
    });
    
  } catch (error) {
    console.error('Error processing AI prompt:', error);
    res.status(500).json({
      success: false,
      message: 'Failed to process AI prompt',
      error: error instanceof Error ? error.message : 'Unknown error',
    });
  }
});

export default router; 