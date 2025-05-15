import { GoogleOAuthProvider } from '@react-oauth/google';
import './App.css';
import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
import ForgetPassword from './pages/forgetpassword';
import VerifyEmail from './pages/verify-email';
import RedirectVerify from './pages/redirect-verify';
import VerifyEmailManual from './pages/verify-email-manual';
import AddMedication from './pages/addMedication';
import MedicationHistory from './pages/medicationHistory';
import Profile from './pages/profile';
import HospitalLocation from './pages/hopitalLocation';
import HealthRecords from './pages/HealthRecords';
import HealthRecordsForm from './pages/healthRecordsForm';
import NotificationSystem from './pages/notification';
import MedicationDetails from './pages/medicationDetails';
import ResetPassword from './pages/resetPassword';
import EmailSent from './pages/emailSent';
import Chatbot from './pages/chatbot';
import MedicalDocuments from './pages/health-records';

const GoogleclientId = import.meta.env.VITE_GOOGLE_CLIENT_ID;

function App() {
  return (
    <GoogleOAuthProvider clientId={GoogleclientId}>
      <BrowserRouter>
        <Routes>
          {/* Redirect root to dashboard */}
          <Route path="/" element={<Navigate to="/dashboard" replace />} />

          {/* Auth Routes */}
          <Route path="/signup" element={<Signup />} />
          <Route path="/signin/*" element={<Signin />} />
          <Route path="/forgetpassword" element={<ForgetPassword />} />
          <Route path="/verify-email" element={<VerifyEmail />} />
          <Route path="/redirect-verify" element={<RedirectVerify />} />
          <Route path="/manualEmailVerification" element={<VerifyEmailManual />} />
          <Route path="/resetPassword/:email" element={<ResetPassword />} />
          <Route path="/emailSent" element={<EmailSent />} />

          {/* Protected Routes with layout */}
          <Route
            path="/*"
            element={
                <Routes>
                  <Route path="dashboard" element={<Dashboard />} />
                  <Route path="addMedication" element={<AddMedication />} />
                  <Route path="medicationHistory" element={<MedicationHistory />} />
                  <Route path="profile" element={<Profile />} />
                  <Route path="hospital-location" element={<HospitalLocation />} />
                  <Route path="health-records" element={<HealthRecords />} />
                  <Route path="healthRecordsForm" element={<HealthRecordsForm />} />
                  <Route path="notifications" element={<NotificationSystem />} />
                  <Route path="medications/:medication_id" element={<MedicationDetails />} />
                  <Route path="chatbot" element={<Chatbot />} />
                  <Route path="medical-documents" element={<MedicalDocuments />} />
                  <Route path="*" element={<Navigate to="/dashboard" replace />} />
                </Routes>
            }
          />
        </Routes>
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
