import express from 'express';
import { initiateChat, getChatMessages, getUserChats, getAvailableDoctors } from '../../controller/chat/doctorPatientChat';
import jwtVerification from '../../middlewares/jwtVerification';

const router = express.Router();

// All routes require authentication

// Initiate a chat between a patient and a doctor
router.post('/initiate', jwtVerification, initiateChat);

// Get chat messages for a specific chat
router.get('/messages/:chatId',jwtVerification, getChatMessages);

// Get all chats for a user (doctor or patient)
router.get('/user-chats',jwtVerification, getUserChats);

// Get all doctors for a patient to start a chat with
router.get('/available-doctors',jwtVerification, getAvailableDoctors);

export default router; 