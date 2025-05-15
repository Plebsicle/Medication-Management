import express from 'express'
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io';
import jwt from 'jsonwebtoken';
import Signup from './routes/signup';
import Signin from './routes/signin'
import emailVerification from './routes/emailVerification'
import isverified from './routes/isverified'
import manualEmail from './routes/manualEmail'
import addMedication from './routes/addMedication'
import verifyToken from './routes/verifyToken'
import toggleNotification from './routes/toggleNotification'
import deleteMedication from './routes/deleteMedication'
import medicationHistory from './routes/medicationHistory'
import serveProfile from './routes/serveProfile'
import profilePhoto from './routes/profilePhoto'
import path from 'path';
import hospitalLocation from './routes/hospitalLocation'
import healthRecords from './routes/healthRecords'
import medicationDetails from './routes/medicationDetails'
import medicationChanges from './routes/medicationChanges'
import forgetPassword from './routes/forgetPassword'
import chatbot from './routes/chatbot';
import sendNotifications from './_utilities/schedule';
import { processMedicalQuery } from './_utilities/chatbot';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

app.use(cors());
app.use(express.json());

// Socket.IO handler for chatbot
io.on('connection', (socket) => {
  console.log('A user connected:', socket.id);

  socket.on('authenticate', (token) => {
    try {
      console.log(token);
      token = token.replace(/^"|"$/g, '');
      if (!token) {
        socket.emit('error', 'No authentication token provided');
        return;
      }
      
      const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as { userId: number };
      socket.data.userId = decoded.userId;
      console.log('User authenticated with ID:', decoded.userId);
      
      // Explicitly acknowledge successful authentication
      socket.emit('authenticated', { success: true });
    } catch (error) {
      console.error('Authentication failed:', error);
      socket.emit('error', 'Authentication failed');
    }
  });

  socket.on('chat message', async (message) => {
    try {
      if (!socket.data || !socket.data.userId) {
        socket.emit('error', 'Authentication required');
        return;
      }

      console.log(`Processing message from user ${socket.data.userId}: ${message}`);
      const response = await processMedicalQuery(socket.data.userId, message);
      socket.emit('chat response', response);
    } catch (error) {
      console.error('Error processing message:', error);
      socket.emit('error', 'Failed to process message');
    }
  });

  socket.on('disconnect', () => {
    console.log('User disconnected:', socket.id);
  });

  // Handle errors
  socket.on('error', (error) => {
    console.error('Socket error:', error);
  });
});

app.use('/signup', Signup);
app.use('/signin',Signin);
app.use('/verifyEmail' , emailVerification);
app.use('/isverified', isverified);
app.use('/manualEmail',manualEmail);
app.use('/addMedication',addMedication);
app.use('/verifyToken',verifyToken);
app.use('/toggleNotification',toggleNotification);
app.use('/deleteMedication',deleteMedication);
app.use('/medicationHistory',medicationHistory);
app.use('/serveProfile',serveProfile);
app.use('/profilePhoto',profilePhoto);
app.use('/hospitalLocation',hospitalLocation);
app.use('/healthRecords',healthRecords);
app.use('/medications',medicationDetails);
app.use('/editMedications',medicationChanges);
app.use('/forgetPassword',forgetPassword);
app.use('/chatbot', chatbot);
sendNotifications();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});