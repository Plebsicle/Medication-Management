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

// Validate FCM endpoint format
function validateAndFixEndpoint(endpoint: string): string {
  // Log the endpoint for debugging
  console.log('Raw endpoint:', endpoint);
  
  // Check Google FCM endpoints
  if (endpoint.includes('fcm.googleapis.com/fcm/send/')) {
    console.log('Fixing FCM endpoint format (send → wp)');
    return endpoint.replace('fcm.googleapis.com/fcm/send/', 'fcm.googleapis.com/wp/');
  }
  
  // Handle various FCM endpoint formats
  if (endpoint.includes('fcm.googleapis.com/') && !endpoint.includes('/wp/')) {
    const parts = endpoint.split('fcm.googleapis.com/');
    if (parts.length > 1) {
      const token = parts[1].split('/').pop();
      if (token) {
        console.log('Reconstructing FCM endpoint with proper format');
        return `https://fcm.googleapis.com/wp/${token}`;
      }
    }
  }
  
  return endpoint;
}

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
    
    if (!subscription || !subscription.endpoint || !subscription.keys || 
        !subscription.keys.p256dh || !subscription.keys.auth) {
      console.error('Invalid subscription object:', subscription);
      res.status(400).json({ error: 'Invalid subscription format' });
      return;
    }
    
    // Fix FCM endpoint format if needed
    const fixedEndpoint = validateAndFixEndpoint(subscription.endpoint);
    
    const response = await prisma.user.findFirst({
      where: { email }
    });
    
    if(!response){
      res.status(401).json({message : "User Does Not Exist" , userExists : false});
      return;
    }
    const userId = response.id;

    // Delete all previous subscriptions for this user to ensure only one active subscription
    await prisma.subscription.deleteMany({
      where: {
        user_id: userId
      }
    });
    
    // Create new subscription
    await prisma.subscription.create({
      data: {
        user_id: userId,
        endpoint: fixedEndpoint,
        expiration_time: subscription.expirationTime
          ? new Date(subscription.expirationTime)
          : null,
        p256dh_key: subscription.keys.p256dh,
        auth_key: subscription.keys.auth,
      },
    });

    // Log the successful subscription
    console.log(`User ${userId} subscribed successfully with endpoint: ${fixedEndpoint}`);

    res.status(201).json({ message: 'Subscribed successfully!' });
  } catch (error) {
    console.error('Subscription Error:', error);
    res.status(500).json({ error: 'Failed to subscribe' });
  }
});

// Send notification route
router.post('/notify', async (req, res) => {
  try {
    const { userId, message } = req.body;
    
    if (!userId || !message) {
      res.status(400).json({ error: 'userId and message are required' });
      return;
    }

    const subscription = await prisma.subscription.findFirst({
      where: { user_id: userId },
    });

    if (!subscription) {
      res.status(404).json({ error: 'Subscription not found' });
      return;
    }

    // Validate the endpoint format
    const fixedEndpoint = validateAndFixEndpoint(subscription.endpoint);
    
    // Update the subscription if the endpoint was fixed
    if (fixedEndpoint !== subscription.endpoint) {
      await prisma.subscription.update({
        where: { subscription_id: subscription.subscription_id },
        data: { endpoint: fixedEndpoint }
      });
      console.log(`Updated endpoint format for user ${userId}`);
    }

    // Create subscription object for web-push
    const pushSubscription = {
      endpoint: fixedEndpoint,
      keys: {
        p256dh: subscription.p256dh_key,
        auth: subscription.auth_key,
      },
    };

    console.log(`Sending notification to user ${userId} at endpoint: ${fixedEndpoint}`);

    // Create and send payload
    const payload = JSON.stringify({ 
      title: 'Medication Reminder', 
      body: message 
    });
    
    // Send notification with more detailed error handling
    try {
      await webpush.sendNotification(pushSubscription, payload);
      console.log(`Notification sent successfully to user ${userId}`);
      res.status(200).json({ message: 'Notification sent!' });
    } catch (pushError: any) {
      console.error('Web Push Error:', pushError);
      
      // Handle expired subscriptions
      if (pushError.statusCode === 404 || pushError.statusCode === 410) {
        console.log(`Subscription for user ${userId} is no longer valid, removing it`);
        await prisma.subscription.delete({
          where: { subscription_id: subscription.subscription_id }
        });
        res.status(410).json({ error: 'Subscription expired or no longer valid' });
      } else {
        res.status(500).json({ 
          error: 'Failed to send push notification',
          details: pushError.message || 'Unknown error'
        });
      }
    }
  } catch (error) {
    console.error('Notification Error:', error);
    res.status(500).json({ error: 'Failed to send notification' });
  }
});

export default router;
