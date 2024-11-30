 import express from 'express'
 import cors from 'cors'
 import Signup from './routes/signup';
import { Sign } from 'crypto';
import Signin from './routes/signin'
import emailVerification from './routes/emailVerification'

 const app = express();
 const router = express.Router();

 app.use(cors());
 app.use(express.json());


 app.use('/signup', Signup);
 app.use('/signin',Signin);
 app.use('/verifyEmail' , emailVerification);
 
 const PORT = 8000;
 app.listen(PORT, () => {
   console.log(`Server is running on port ${PORT}`);
 });