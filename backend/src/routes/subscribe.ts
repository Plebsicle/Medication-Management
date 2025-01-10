import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import webpush from 'web-push';
import jwt from 'jsonwebtoken'

const prisma = new PrismaClient();
const router = Router();

// Web Push VAPID keys (store these in environment variables)
const PUBLIC_VAPID_KEY = process.env.VAPID_PUBLIC_KEY!;
const PRIVATE_VAPID_KEY = process.env.VAPID_PRIVATE_KEY!;

webpush.setVapidDetails(
  'mailto:your-email@example.com',
  PUBLIC_VAPID_KEY,
  PRIVATE_VAPID_KEY
);

// Subscribe route
router.post('/subscribe', async (req, res) => {
  const authHeader = req.headers.authorization;
      if (!authHeader) {
          res.status(401).json({ error: "Authorization header is missing" });
          return;
      }
  
      let token = req.headers['authorization']?.split(' ')[1];
      if(!token){res.status(400).json({message : "No Token Found",isTokenPresent : true});return;}
      if (token) {
          token = token.replace(/^"|"$/g, '');
      }
  
      let email;
  
      try {
          const decoded: any = jwt.verify(token, process.env.JWT_SECRET as string);
          email = decoded.email;
          if (!email) {
              res.status(400).json({ error: "Email not found in token" });
              return;
          }
      } catch (error) {
          res.status(401).json({ error: "Invalid or expired token" });
          return;
      }

  try {
    const { subscription } = req.body;
    const response = await prisma.user.findFirst({
      where : {email}
    });
    if(!response){
      res.status(401).json({message : "User Does Not Exist" , userExists : false});
      return;
    }
    const userId = response.id;

    // Check if a subscription already exists for this user and endpoint
    const existingSubscription = await prisma.subscription.findFirst({
      where: {
        user_id: userId,
        endpoint: subscription.endpoint,
      },
    });

    if (existingSubscription) {
      // Update the existing subscription
      await prisma.subscription.update({
        where: { subscription_id: existingSubscription.subscription_id },
        data: {
          expiration_time: subscription.expirationTime
            ? new Date(subscription.expirationTime)
            : null,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
        },
      });
    } else {
      // Create a new subscription
      await prisma.subscription.create({
        data: {
          user_id: userId,
          endpoint: subscription.endpoint,
          expiration_time: subscription.expirationTime
            ? new Date(subscription.expirationTime)
            : null,
          p256dh_key: subscription.keys.p256dh,
          auth_key: subscription.keys.auth,
        },
      });
    }

    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});


router.post('/notify', async (req, res) => {
  try {
    const { userId, message } = req.body;

    const subscription = await prisma.subscription.findFirst({
      where: { user_id: userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Send notification
    const payload = JSON.stringify({ title: 'Medication Reminder', body: message });
    await webpush.sendNotification(
      {
        endpoint: subscription.endpoint,
        keys: {
          p256dh: subscription.p256dh_key,
          auth: subscription.auth_key,
        },
      },
      payload
    );

    res.status(200).json({ message: 'Notification sent!' });
  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;
