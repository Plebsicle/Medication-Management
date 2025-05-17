import prisma from "../../database";
import {Request,Response} from 'express'

export const updateNotificationPreferences  =  async (req : Request, res : Response) => {
    const email = req.userEmail;
    try { 
      
      const { email_notifications, sms_notifications } = req.body;

      const user = await prisma.user.findUnique({
        where: { email },
      });

      if (!user) {
        res.status(404).json({ error: 'User not found' });
        return;
      }

      const updateData: Record<string, boolean> = {};

      if (email_notifications !== undefined) {
        updateData.email_notifications = email_notifications;
      }

      if (sms_notifications !== undefined) {
        updateData.sms_notifications = sms_notifications;
      }

      if (Object.keys(updateData).length === 0) {
        res.status(400).json({ error: 'No valid notification preferences provided' });
        return;
      }

      const updatedUser = await prisma.user.update({
        where: { id: user.id },
        data: updateData,
      }) as any;

      res.status(200).json({
        message: 'Notification preferences updated successfully',
        success: true,
        preferences: {
          email_notifications: updatedUser.email_notifications,
          sms_notifications: updatedUser.sms_notifications
        }
      });
    } catch (error) {
      console.error('Error updating notification preferences:', error);
      res.status(500).json({ 
        error: 'Internal server error',
        success: false 
      });
    }
  }
