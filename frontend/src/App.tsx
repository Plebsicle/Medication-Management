import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/auth/signup';
import Signin from './pages/auth/signin';
import Dashboard from './pages/dashboard/dashboard';
import DoctorDashboard from './pages/dashboard/doctorDashboard';
import ForgetPassword from './pages/user/forgetpassword';
import VerifyEmail from './pages/email/verify-email';
import RedirectVerify from './pages/user/redirect-verify';
import VerifyEmailManual from './pages/email/verify-email-manual';
import AddMedication from './pages/medication/addMedication';
import MedicationHistory from './pages/medication/medicationHistory';
import Profile from './pages/user/profile';
import HospitalLocation from './pages/miscellanous/hopitalLocation';
import HealthRecords from './pages/health/HealthRecords';
import HealthRecordsForm from './pages/health/healthRecordsForm';
import MedicationDetails from './pages/medication/medicationDetails';
import ResetPassword from './pages/user/resetPassword';
import EmailSent from './pages/email/emailSent';
import Chatbot from './pages/chats/chatbot';
import MedicalDocuments from './pages/health/medicalDocuments';
import PatientChatList from './pages/chats/PatientChatList';
import DoctorChatList from './pages/chats/DoctorChatList';
import PatientChat from './pages/chats/PatientChat';
import DoctorChat from './pages/chats/DoctorChat';
import Home from './pages/home/HomePage';
import { AuthProvider } from './hooks/useAuth';
import { SocketProvider } from './lib/socketContext';

const GoogleclientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GoogleclientId}>
      <AuthProvider>
        <SocketProvider>
          <BrowserRouter>
            <Routes>
              <Route path='/' element={<Home/>}/>
              <Route path="/signup" element={<Signup />} />
              <Route path="/signin/*" element={<Signin />} />
              <Route path="/forgetpassword" element={<ForgetPassword />} />
              <Route path="/verify-email" element={<VerifyEmail />} />
              <Route path="/redirect-verify" element={<RedirectVerify />} />
              <Route path="/manualEmailVerification" element={<VerifyEmailManual />} />
              <Route path="/resetPassword/:email" element={<ResetPassword />} />
              <Route path="/emailSent" element={<EmailSent />} />
              <Route
                path="/*"
                element={
                    <Routes>
                      <Route path="dashboard" element={<Dashboard />} />
                      <Route path="doctorDashboard" element={<DoctorDashboard />} />
                      <Route path="addMedication" element={<AddMedication />} />
                      <Route path="medicationHistory" element={<MedicationHistory />} />
                      <Route path="profile" element={<Profile />} />
                      <Route path="hospital-location" element={<HospitalLocation />} />
                      <Route path="health-records" element={<HealthRecords />} />
                      <Route path="healthRecordsForm" element={<HealthRecordsForm />} />
                      <Route path="medications/:medication_id" element={<MedicationDetails />} />
                      <Route path="chatbot" element={<Chatbot />} />
                      <Route path="medical-documents" element={<MedicalDocuments />} />
                      <Route path="patient/chats" element={<PatientChatList />} />
                      <Route path="patient/chat/:chatId" element={<PatientChat />} />
                      <Route path="doctor/chats" element={<DoctorChatList />} />
                      <Route path="doctor/chat/:chatId" element={<DoctorChat />} />
                      <Route path='medicationDetails/:medication_id' element={<MedicationDetails/>}></Route>
                    </Routes>
                }
              />
            </Routes>
          </BrowserRouter>
        </SocketProvider>
      </AuthProvider>
    </GoogleOAuthProvider>
  );
}

export default App;
