import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io';

import Signup from './routes/auth/signup';
import Signin from './routes/auth/signin'
import emailVerification from './routes/email/email'
import manualEmail from './routes/user/manualEmail'
import addMedication from './routes/medication/postMedication'
import verifyToken from './routes/user/verifyToken'
import toggleNotification from './routes/user/toggleNotification'
import deleteMedication from './routes/medication/postMedication'
import medicationHistory from './routes/medication/medicationHistory'
import serveProfile from './routes/user/serveProfile'
import profilePhoto from './routes/user/profilePhoto'
import hospitalLocation from './routes/miscellanous/hospitalLocation'
import healthRecords from './routes/health/healthRecords'
import medicationDetails from './routes/medication/medicationDetails'
import medicationChanges from './routes/medication/medicationChanges'
import forgetPassword from './routes/user/forgetPassword'
import chatbot from './routes/chat/chatbot';
import doctorPatientChat from './routes/chat/doctorPatientChat';
import medicalDocuments from './routes/health/medicalDocuments';
import fileRoutes from './routes/fileRoutes';
import sendNotifications from './_utilities/schedule';
import { configureSocket } from './AI-Socket';
import { configureSocketHandlers } from './socket';

const app = express();
const server = http.createServer(app);

const allowedOrigins = [
  'https://plebsicle.me',      
  'http://localhost:5173',         
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin) return callback(null, true);
    if (allowedOrigins.includes(origin)) {
      return callback(null, true);
    } else {
      return callback(new Error('CORS not allowed from this origin'));
    }
  },
  credentials: true
}));

// Add Cross-Origin-Opener-Policy header after cors middleware
app.use((req, res, next) => {
  console.log(`Request: ${req.method} ${req.path}`);
  res.setHeader('Cross-Origin-Opener-Policy', 'unsafe-none');
  const originalSend = res.send;
  res.send = function(...args) {
    console.log('Response headers:', res.getHeaders());
    return originalSend.apply(this, args);
  };
  next();
});

const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    methods: ["GET", "POST"],
    credentials: true
  }
});

// Configure AI Socket
configureSocket(io);

// Configure doctor-patient chat socket
configureSocketHandlers(io);


app.use(express.json());

app.use('/signup', Signup);
app.use('/signin',Signin);
app.use('/verifyEmail' , emailVerification);
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
app.use('/chats', doctorPatientChat);
app.use('/medicalDocuments', medicalDocuments);
app.use('/files', fileRoutes);
sendNotifications();


const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});