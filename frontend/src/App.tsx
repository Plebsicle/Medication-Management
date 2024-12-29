import { GoogleOAuthProvider} from '@react-oauth/google';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
import ForgetPassword from './pages/forgetpassword';
import VerifyEmail from './pages/verify-email'
import RedirectVerify from './pages/redirect-verify'
import VerifyEmailManual from './pages/verify-email-manual';
import AddMedication from './pages/addMedication';
import MedicationHistory from './pages/medicationHistory';
import Profile from './pages/profile'
import EmailUpdate from './pages/emailUpdate'

const GoogleclientId =import.meta.env.VITE_GOOGLE_CLIENT_ID

function Routing(){
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/signin" element={<Signin/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}/>
        <Route path='/forgetpassword' element={<ForgetPassword/>}></Route>
        <Route path="/verify-email" element={<VerifyEmail/>}/>
        <Route path='/redirect-verify' element={<RedirectVerify/>}></Route>
        <Route path='/manualEmailVerification' element={<VerifyEmailManual/>}></Route>
        <Route path='/addMedication' element={<AddMedication></AddMedication>}></Route>
        <Route path='/medicationHistory' element={<MedicationHistory/>}></Route>
        <Route path='/profile' element={<Profile/>}></Route>
        {/* <Route path='/emailUpdate' element={<EmailUpdate/>}></Route> */}
      </Routes>
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId={GoogleclientId}>
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
