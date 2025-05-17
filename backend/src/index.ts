
import * as dotenv from 'dotenv';
dotenv.config();

import express from 'express'
import cors from 'cors'
import http from 'http';
import { Server } from 'socket.io';

import Signup from './routes/auth/signup';
import Signin from './routes/auth/signin'
import emailVerification from './routes/email/email'
import isverified from './routes/user/manualEmail'
import manualEmail from './routes/user/manualEmail'
import addMedication from './routes/medication/medication'
import verifyToken from './routes/user/verifyToken'
import toggleNotification from './routes/user/toggleNotification'
import deleteMedication from './routes/medication/medication'
import medicationHistory from './routes/medication/medicationHistory'
import serveProfile from './routes/user/serveProfile'
import profilePhoto from './routes/user/profilePhoto'
import hospitalLocation from './routes/miscellanous/hospitalLocation'
import healthRecords from './routes/health/healthRecords'
import medicationDetails from './routes/medication/medicationDetails'
import medicationChanges from './routes/medication/medicationChanges'
import forgetPassword from './routes/user/forgetPassword'
import chatbot from './routes/chat/chatbot';
import medicalDocuments from './routes/health/medicalDocuments';
import sendNotifications from './_utilities/schedule';
import { configureSocket } from './AI-Socket';

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

configureSocket(io);

app.use(cors());
app.use(express.json());


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
app.use('/medicalDocuments', medicalDocuments);
sendNotifications();


const PORT = 8000;
server.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});