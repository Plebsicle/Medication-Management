import express, { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { uploadDocument, getDocument } from '../_utilities/aws-s3';
import multer from 'multer';
import { v4 as uuidv4 } from 'uuid';
import path from 'path';
import prisma from '../database';

// Configure multer for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png'];
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Invalid file type. Only JPEG, JPG and PNG are allowed.') as any);
    }
  }
});

interface AuthenticatedRequest extends Request {
  user: {
    email: string;
  };
  file?: Express.Multer.File;
}

const router = express.Router();

// Helper middleware for token authentication
const authenticateToken = (req: Request, res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(401).json({ error: "Authorization header is missing" });
    return;
  }

  let token = authHeader.split(' ')[1]; 
  if (token) {
    token = token.replace(/^"|"$/g, ''); 
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
    (req as AuthenticatedRequest).user = { email: decoded.email };
    next();
  } catch (error) {
    res.status(401).json({ error: "Invalid or expired token" });
    return;
  }
};

router.get('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = authHeader.split(' ')[1]; 
    if (token) {
        token = token.replace(/^"|"$/g, ''); 
    }

    let email: string | undefined;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };

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
        const user = await prisma.user.findFirst({
            where: { email },
        });

        if (!user) {
            res.status(404).json({ message: "User not found" });
            return;
        }

        // Using type assertion to access all user properties
        const userData = user as any;

        res.status(200).json({
            name: userData.name,
            email: userData.email,
            role: userData.role,
            path: userData.profile_photo_path || null,
            email_notifications: userData.email_notifications,
            sms_notifications: userData.sms_notifications,
        });
    } catch (error) {
        console.error("Error in serving profile data", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

router.post('/', async (req, res) => {
    const authHeader = req.headers.authorization;

    if (!authHeader) {
        res.status(401).json({ error: "Authorization header is missing" });
        return;
    }

    let token = authHeader.split(' ')[1]; 
    if (token) {
        token = token.replace(/^"|"$/g, ''); 
    }

    let email;
    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { email: string };
        email = decoded.email;

        if (!email) {
            res.status(400).json({ error: "Email not found in token" });
            return;
        }
    } catch (error) {
        res.status(401).json({ error: "Invalid or expired token" });
        return;
    }

    const updates = req.body;

    if (!updates || Object.keys(updates).length === 0) {
        res.status(400).json({ error: "No data provided for update" });
        return;
    }

    try {
        // Only allow updating name and profile photo
        const validFields = ["name", "profile_photo_path"];
        const updateData: Record<string, any> = {};  
        for (const key in updates) {
            if (validFields.includes(key)) {
                updateData[key] = updates[key];
            } else {
                res.status(400).json({ error: `Invalid field: ${key}`});
                return;
            }
        }
        const updatedUser = await prisma.user.update({
            where: { email },
            data: updateData,
        });
        res.status(200).json({ message: "Profile updated successfully", user: updatedUser });
    } catch (error) {
        console.error("Error updating profile", error);
        res.status(500).json({ error: "Internal server error" });
    }
});

// Add updateNotificationPreferences route to handle notification preference changes
router.post('/updateNotificationPreferences', 
  authenticateToken, 
  async (req, res) => {
    try {
      const { email } = (req as any).user;
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
);

// Add route for uploading profile photo using S3
router.post('/profilePhoto',
  authenticateToken,
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      const { fileType } = req.body;

      if (!fileType) {
        res.status(400).json({ error: "Missing file type" });
        return;
      }

      const fileExtension = fileType.split('/')[1];
      const fileName = `profile-${uuidv4()}.${fileExtension}`;

      // Generate pre-signed URL
      const uploadUrl = await uploadDocument(fileName, fileType);

      // Save S3 path to DB
      const s3Path = `medication/${fileName}`;
      await prisma.user.update({
        where: { email: authReq.user.email },
        data: { profile_photo_path: s3Path },
      });

      res.status(200).json({
        message: "Upload URL generated",
        uploadUrl,
        path: s3Path,
      });
    } catch (error) {
      console.error("Error generating presigned URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

// Add route to get a signed URL for the profile photo
router.get('/getPhotoUrl', 
  authenticateToken, 
  async (req: Request, res: Response) => {
    try {
      const authReq = req as AuthenticatedRequest;
      
      // Get user to access their profile photo path
      const user = await prisma.user.findUnique({
        where: { email: authReq.user.email },
        select: { profile_photo_path: true }
      });

      if (!user || !user.profile_photo_path) {
        res.status(404).json({ error: "Profile photo not found" });
        return;
      }

      // Extract filename from the S3 path
      const pathParts = user.profile_photo_path.split('/');
      const filename = pathParts[pathParts.length - 1];
      
      // Get the file extension to determine content type
      const fileExt = path.extname(filename).toLowerCase();
      let contentType: string = 'image/jpeg'; // Default
      
      if (fileExt === '.png') {
        contentType = 'image/png';
      } else if (fileExt === '.jpg' || fileExt === '.jpeg') {
        contentType = 'image/jpeg';
      }

      // Get a signed URL for the image
      const url = await getDocument(filename, contentType as any);
      
      res.status(200).json({ url });
    } catch (error) {
      console.error("Error getting profile photo URL:", error);
      res.status(500).json({ error: "Internal server error" });
    }
  }
);

export default router;
