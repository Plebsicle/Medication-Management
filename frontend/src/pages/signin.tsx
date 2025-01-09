import  { useState } from 'react';
import { TextField, Button, Box, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {toast,Bounce} from 'react-toastify'

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;
      const response = await axios.post('http://localhost:8000/signin', {
        googleId: googleToken,
      });
  
      if (response.data.userFound === false) {
        toast.error('Account does not exist. Please sign up.', {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
          transition: Bounce,
        });
        return;
      }
  
      if (response.data.jwt) {
        localStorage.setItem('jwt', JSON.stringify(response.data.jwt));
        toast.success('Sign In Successful!', {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
          transition: Bounce,
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Error in Google Signin:', error);
      toast.error('An error occurred during Google Signin.', {
        position: "top-center",
        autoClose: 5000,
        theme: "dark",
        transition: Bounce,
      });
    }
  };
  

  const handleGoogleFailure = () => {
    toast.error('Google Login Failed!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: false,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
      theme: "dark",
      transition: Bounce,
      });
  };

  async function manualSigninHandler() {
    try {
      const response = await axios.post('http://localhost:8000/signin', {email,password,});
      console.log(response.data);
      if (response.data.jwt) {
        localStorage.setItem('jwt', JSON.stringify(response.data.jwt));
        toast.success('Sign In Successful!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
        });
        navigate('/dashboard');
      } 
      else if(response.data.zodpass === false){toast.error('Entered Details do not match the criteria!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.userFound === false){toast.error('Signup Before you Sign in!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.isPasswordSet === false){toast.error('Your Password has not been set up yet , signin with Google!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.isEmailVerified === false){toast.error('Verify Your Email Before You signin!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.isPasswordCorrect === false){toast.error('Enter The Correct Password!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.fullDetails === false){toast.error('Please Enter Complete Details!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
      else if(response.data.serverError){toast.error('Server Error!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });}
    } catch (error) {
      console.log("Error from manual Signin", error);
      toast.error('Error from manual Signin!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
      });
    }
  }

  return (
    <div className="flex items-center justify-center min-h-screen pr-36 pt-16"
      style={{
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '80vh',
        width: '88vw',
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
          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
            onClick={() => navigate('/forgetPassword')}
          >
            Forget Passowrd
          </Button>
      </Box>
    </div>
  );
}
