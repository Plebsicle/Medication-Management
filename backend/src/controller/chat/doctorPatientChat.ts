import express from 'express';
import prisma from '../../database/client';

// Initiate a chat between a patient and a doctor
export const initiateChat = async (req: express.Request, res: express.Response) => {
  try {
    const { doctorId } = req.body;
    const patientId = req.userId;

    if (!patientId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Check if a chat already exists
    const existingChat = await prisma.doctor_patient_chat.findUnique({
      where: {
        doctor_id_patient_id: {
          doctor_id: Number(doctorId),
          patient_id: patientId,
        },
      },
    });

    if (existingChat) {
      res.status(200).json({ chatId: existingChat.chat_id });
      return;
    }

    // Create a new chat
    const newChat = await prisma.doctor_patient_chat.create({
      data: {
        doctor_id: Number(doctorId),
        patient_id: patientId,
      },
    });

    res.status(201).json({ chatId: newChat.chat_id });
  } catch (error) {
    console.error('Error initiating chat:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get chat messages for a specific chat
export const getChatMessages = async (req: express.Request, res: express.Response) => {
  try {
    const { chatId } = req.params;
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Verify that the user is part of this chat
    const chat = await prisma.doctor_patient_chat.findUnique({
      where: {
        chat_id: Number(chatId),
      },
    });

    if (!chat) {
      res.status(404).json({ error: 'Chat not found' });
      return;
    }

    if (chat.doctor_id !== Number(userId) && chat.patient_id !== Number(userId)) {
      res.status(403).json({ error: 'You are not authorized to view this chat' });
      return;
    }

    // Fetch messages
    const messages = await prisma.chat_message.findMany({
      where: {
        chat_id: Number(chatId),
      },
      orderBy: {
        created_at: 'asc',
      },
      include: {
        user: {
          select: {
            id: true,
            name: true,
            profile_photo_path: true,
            role: true,
          },
        },
      },
    });

    res.status(200).json({ messages });
  } catch (error) {
    console.error('Error getting chat messages:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
};

// Get all chats for a user (doctor or patient)
export const getUserChats = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.userId;
    const userRole = req.userRole;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    let chats;
    
    if (userRole === 'doctor') {
      // Get all patient chats for this doctor
      chats = await prisma.doctor_patient_chat.findMany({
        where: {
          doctor_id: userId,
        },
        include: {
          patient: {
            select: {
              id: true,
              name: true,
              profile_photo_path: true,
            },
          },
          chatMessages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });
    } else {
      // Get all doctor chats for this patient
      chats = await prisma.doctor_patient_chat.findMany({
        where: {
          patient_id: Number(userId),
        },
        include: {
          doctor: {
            select: {
              id: true,
              name: true,
              profile_photo_path: true,
            },
          },
          chatMessages: {
            orderBy: {
              created_at: 'desc',
            },
            take: 1,
          },
        },
        orderBy: {
          updated_at: 'desc',
        },
      });
    }

    res.status(200).json({ chats });
    return;
  } catch (error) {
    console.error('Error getting user chats:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
};

// Get all doctors for a patient to start a chat with
export const getAvailableDoctors = async (req: express.Request, res: express.Response) => {
  try {
    const userId = req.userId;

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Get all doctors
    const doctors = await prisma.user.findMany({
      where: {
        role: 'doctor',
      },
      select: {
        id: true,
        name: true,
        profile_photo_path: true,
        doctor: true,
      },
    });

    res.status(200).json({ doctors });
    return;
  } catch (error) {
    console.error('Error getting available doctors:', error);
    res.status(500).json({ error: 'Internal server error' });
    return;
  }
}; 