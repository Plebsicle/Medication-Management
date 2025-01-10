import express from 'express'
import cors from 'cors'
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
import subscriptionRoutes from './routes/subscribe'
import forgetPassword from './routes/forgetPassword'
import webpush from 'web-push';
import sendNotifications from './_utilities/schedule';

const app = express();
const router = express.Router();


webpush.setVapidDetails(
  'mailto:your-email@example.com',
  process.env.VAPID_PUBLIC_KEY!,
  process.env.VAPID_PRIVATE_KEY!
);

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
app.use('/',subscriptionRoutes);
sendNotifications();

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const PORT = 8000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});