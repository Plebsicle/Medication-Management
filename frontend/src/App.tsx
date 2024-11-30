import { GoogleOAuthProvider} from '@react-oauth/google';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
import ForgetPassword from './pages/forgetpassword';
import VerifyEmail from './pages/verify-email'

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
