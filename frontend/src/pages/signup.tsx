import { useState } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import { toast, Bounce } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

type Role = 'patient' | 'caregiver' | 'doctor';

export default function Signup() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [role, setRole] = useState<Role>('patient');
  const navigate = useNavigate();

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const googleToken = credentialResponse.credential;
      const response = await axios.post('http://localhost:8000/signup', {
        googleId: googleToken,
        role,
      });

      if (response.data.jwt) {
        localStorage.setItem('jwt', JSON.stringify(response.data.jwt));
        toast.success('Sign Up Successful!', {
          position: "top-center",
          autoClose: 5000,
          theme: "dark",
          transition: Bounce,
        });
        navigate('/dashboard');
      } else if (response.data.EmailinUse) {
        toast.error('Email is already in use!', {
          position: "top-center",
          autoClose: 5000,
        });
      } else if (!response.data.validDetails) {
        toast.error('Invalid Google Credentials!', {
          position: "top-center",
          autoClose: 5000,
        });
      }
    } catch (error) {
      toast.error('Error during Google signup!', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  };

  const handleGoogleFailure = () => {
    toast.error('Google login failed!', {
      position: "top-center",
      autoClose: 5000,
    });
  };

  async function manualSignuphandler() {
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        name,
        email,
        password,
        role,
      });

      if (response.data.EmailinUse) {
        toast.error('Email is already in use!', {
          position: "top-center",
          autoClose: 5000,
        });
      } else if (!response.data.zodPass) {
        toast.error('Entered Details Do Not Match the Criteria!', {
          position: "top-center",
          autoClose: 5000,
        });
      } else if (response.data.serverError) {
        toast.error('Server Error! Please try again later.', {
          position: "top-center",
          autoClose: 5000,
        });
      } else if (!response.data.isEmailVerified) {
        toast.info('Verification email sent. Please check your inbox.', {
          position: "top-center",
          autoClose: 5000,
        });
        navigate('/redirect-verify');
        const interval = setInterval(async () => {
          try {
            const verifiedResponse = await axios.post('http://localhost:8000/isverified', {
              email,
            });
            if (verifiedResponse.data.verified) {
              clearInterval(interval);
              toast.success('Email Verified! Redirecting to Dashboard...', {
                position: "top-center",
                autoClose: 5000,
              });
              navigate('/dashboard');
            }
          } catch (error) {
            console.error('Error checking verification status', error);
          }
        }, 3000);
      }
    } catch (error) {
      toast.error('Error during manual signup!', {
        position: "top-center",
        autoClose: 5000,
      });
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen min-w-full pr-36 pt-12"
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
          boxShadow: 3,
        }}
      >
        <Typography variant="h4" component="h1" gutterBottom align="center">
          Sign Up
        </Typography>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            manualSignuphandler();
          }}
        >
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />

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

          <FormControl fullWidth margin="normal">
            <InputLabel id="role-label">Role</InputLabel>
            <Select
              labelId="role-label"
              value={role}
              onChange={(e) => setRole(e.target.value as Role)}
            >
              <MenuItem value="patient">Patient</MenuItem>
              <MenuItem value="caregiver">Caregiver</MenuItem>
              <MenuItem value="doctor">Doctor</MenuItem>
            </Select>
          </FormControl>

          <Button
            type="submit"
            variant="contained"
            color="primary"
            fullWidth
            sx={{ mt: 2 }}
          >
            Sign Up
          </Button>
        </form>

        <Typography variant="body1" align="center" sx={{ my: 2 }}>
          Or sign up with Google
        </Typography>

        <GoogleLogin
          onSuccess={handleGoogleSuccess}
          onError={handleGoogleFailure}
          theme="filled_blue"
          text="continue_with"
        />
        <Button
          type="button"
          variant="contained"
          color="primary"
          fullWidth
          sx={{ mt: 2 }}
          onClick={() => navigate('/signin')}
        >
          Sign In
        </Button>
      </Box>
    </div>
  );
}
