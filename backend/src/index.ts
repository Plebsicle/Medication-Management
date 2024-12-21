 import express from 'express'
 import cors from 'cors'
 import Signup from './routes/signup';
import Signin from './routes/signin'
import emailVerification from './routes/emailVerification'
import isverified from './routes/isverified'
import manualEmail from './routes/manualEmail'
 const app = express();
 const router = express.Router();

 app.use(cors());
 app.use(express.json());

 app.use('/signup', Signup);
 app.use('/signin',Signin);
 app.use('/verifyEmail' , emailVerification);
 app.use('/isverified', isverified);
 app.use('/manualEmail',manualEmail);
 const PORT = 8000;
 app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
 });