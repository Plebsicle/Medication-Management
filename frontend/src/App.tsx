import { useState } from 'react';
import { GoogleOAuthProvider, GoogleLogin } from '@react-oauth/google';
import './App.css';
import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Signup from './pages/signup';
import Signin from './pages/signin';
import Dashboard from './pages/dashboard';
function Routing() {
  return (
    <div>
      <Routes>
        <Route path="/signup" element={<Signup/>}/>
        <Route path="/signin" element={<Signin/>}></Route>
        <Route path="/dashboard" element={<Dashboard/>}/>
      </Routes>
      
    </div>
  );
}

function App() {
  return (
    <GoogleOAuthProvider clientId="804338440665-dqv8de9gl1mpns42p1h271t1etmluhfn.apps.googleusercontent.com">
      <BrowserRouter>
        <Routing />
      </BrowserRouter>
    </GoogleOAuthProvider>
  );
}

export default App;
