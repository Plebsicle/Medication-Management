import { Request, Response, NextFunction } from 'express';
import prisma from '../database';


const MAX_AI_PROMPTS = 10;

export const checkAiLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const userId = req.userId;
  try {
    // Check the user's current AI usage
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    const rawUser = await prisma.$queryRaw`SELECT ai_prompts_count FROM "user" WHERE id = ${userId}` as { ai_prompts_count: number }[];
    const aiPromptsCount = rawUser[0]?.ai_prompts_count || 0;

    if (aiPromptsCount >= MAX_AI_PROMPTS) {
      res.status(403).json({
        error: 'AI prompt limit reached',
        message: 'You have reached your limit of 10 AI prompts. Please contact support for more information.'
      });
      return;
    }
    next();
  } catch (error) {
    console.error('Error in AI limit middleware:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const incrementAiPromptCount = async (userId: number) => {
  try {
    await prisma.$executeRaw`UPDATE "user" SET ai_prompts_count = ai_prompts_count + 1 WHERE id = ${userId}`;
  } catch (error) {
    console.error('Error incrementing AI prompt count:', error);
  }
}; 