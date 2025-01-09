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
import HospitalLocation from './pages/hopitalLocation';
import HealthRecords from './pages/HealthRecords';
import  HealthRecordsForm  from './pages/healthRecordsForm';
import NotificationSystem from './pages/notification';
import MedicationDetails from './pages/medicationDetails';
import { ToastContainer } from 'react-toastify';
import ResetPassword from './pages/resetPassword'
import EmailSent from './pages/emailSent';

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
        <Route path='/hospital-location' element={<HospitalLocation/>}></Route>
        <Route path='/health-records' element={<HealthRecords/>}></Route>
        <Route path='/healthRecordsForm' element={<HealthRecordsForm/>}></Route>
        <Route path='/notifications' element={<NotificationSystem/>}></Route>
        <Route path='/medications/:medication_id' element={<MedicationDetails/>}></Route>
        <Route path='/resetPassword/:email' element={<ResetPassword/>}></Route>
        <Route path='/emailSent' element={<EmailSent/>}></Route>
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
      <ToastContainer/>
    </GoogleOAuthProvider>
  );
}

export default App;
