import {incrementAiPromptCount} from '../../middlewares/aiLimitMiddleware'
import express from 'express';

export const AIChat = async (req : express.Request, res : express.Response): Promise<void> => {
  try {
    const { message } = req.body;
    const userId = req.userId;
    if(!userId) return;
    
    if (!message) {
      res.status(400).json({ error: 'Message is required' });
      return;
    }
    const response = `AI response to: ${message}`;
    
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
}