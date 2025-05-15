import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import prisma from '../database';

interface AuthenticatedRequest extends Request {
  user: {
    id: number;
    email: string;
  };
}

const MAX_AI_PROMPTS = 10;

export const checkAiLimit = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Extract the token
    const authHeader = req.headers.authorization;
    if (!authHeader) {
      res.status(401).json({ error: 'Authorization header missing' });
      return;
    }

    let token = authHeader.split(' ')[1];
    if (token) {
      token = token.replace(/^"|"$/g, '');
    }

    // Verify and decode the token
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string, id: string };
    const userId = parseInt(decoded.id, 10);

    // Check the user's current AI usage
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true }
    });

    if (!user) {
      res.status(404).json({ error: 'User not found' });
      return;
    }

    // Use a separate query to get the raw data with the new field
    const rawUser = await prisma.$queryRaw`SELECT ai_prompts_count FROM "user" WHERE id = ${userId}` as { ai_prompts_count: number }[];
    const aiPromptsCount = rawUser[0]?.ai_prompts_count || 0;

    // Check if the user has reached their limit
    if (aiPromptsCount >= MAX_AI_PROMPTS) {
      res.status(403).json({
        error: 'AI prompt limit reached',
        message: 'You have reached your limit of 10 AI prompts. Please contact support for more information.'
      });
      return;
    }

    // Set user details for the next middleware
    (req as AuthenticatedRequest).user = {
      id: userId,
      email: decoded.email
    };

    next();
  } catch (error) {
    console.error('Error in AI limit middleware:', error);
    res.status(401).json({ error: 'Invalid or expired token' });
    return;
  }
};

export const incrementAiPromptCount = async (userId: number) => {
  try {
    // Use raw query to increment the count since Prisma client doesn't know about the field yet
    await prisma.$executeRaw`UPDATE "user" SET ai_prompts_count = ai_prompts_count + 1 WHERE id = ${userId}`;
  } catch (error) {
    console.error('Error incrementing AI prompt count:', error);
  }
}; 