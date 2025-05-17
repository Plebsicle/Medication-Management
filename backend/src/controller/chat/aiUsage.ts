import express from 'express';
import prisma from '../../database';
import jwt from 'jsonwebtoken'; 



export const AIUsage = async (req: express.Request, res: express.Response): Promise<void> => {
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
    const decoded  = jwt.verify(token, process.env.JWT_SECRET as string) as  {userId : string , email : string , role : string , name : string}
    const userId = parseInt(decoded.userId, 10);
    
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
}