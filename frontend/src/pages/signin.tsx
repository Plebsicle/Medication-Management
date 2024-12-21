import  { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.response;
      const jwtToken = await axios.post('http://localhost:8000/signin', {
        googleId: googleToken,
      });
      if (!jwtToken) {
        console.log("Invalid Credentials");
      } else {
        localStorage.setItem('jwtToken', JSON.stringify(jwtToken));
        navigate('/dashboard');
      }
    } catch (error) {
      console.log("Error in Google signin", error);
    }
  };

  const handleGoogleFailure = () => {
    alert('Google login failed!');
  };

  async function manualSigninHandler() {
    try {
      const response = await axios.post('http://localhost:8000/signin', {email,password,});
      console.log(response.data);
      if (response.data.jwt) {
        localStorage.setItem('jwtToken', JSON.stringify(response.data.jwt));
        navigate('/dashboard');
      } 
      else if(response.data.zodpass === false){alert("Entered Details do not match the criteria")}
      else if(response.data.userFound === false){alert("Signup Before you Sign in")}
      else if(response.data.isPasswordSet === false){alert("Your Password has not been set up yet , signin with Google")}
      else if(response.data.isEmailVerified === false){alert("Verify Your Email Before You signin")}
      else if(response.data.isPasswordCorrect === false){alert("Enter The Correct Password")}
      else if(response.data.fullDetails === false){alert("Please Enter Complete Details")}
      else if(response.data.serverError){alert("Server Error")}
    } catch (error) {
      console.log("Error from manual Signin", error);
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-900"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        width: '90vw',
      }}
    >
      <Box 
        sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 3
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign In
        </Typography>

        <form onSubmit={(e) => { e.preventDefault(); manualSigninHandler(); }}>
          <TextField
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
          />

          <TextField
            label="Password"
            variant="outlined"
            fullWidth
            margin="normal"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
          />

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign In
          </Button>
          
        </form>

        <Typography variant="body1" align="center" sx={{ my: 2 }}>
          Or sign in with Google
        </Typography>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          theme="filled_blue"
          text="signin_with"
        />
        <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/signup')}
          >
            Sign Up
          </Button>
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/manualEmailVerification')}
          >
            Verify Email
          </Button>
      </Box>
    </div>
  );
}
