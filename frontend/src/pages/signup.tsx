import { useState } from 'react';
import { TextField, Button, MenuItem, Select, InputLabel, FormControl, Box, Typography } from '@mui/material';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

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
      console.log(googleToken);
      const jwtToken = await axios.post('http://localhost:8000/signup', {
        googleId: googleToken,
        role,
      });
      if (!jwtToken) {
        console.log('Invalid Credentials');
      } else {
        localStorage.setItem('jwtToken', JSON.stringify(jwtToken));
        navigate('/dashboard');
      }
    } catch (error) {
      console.log('Error in Google signup', error);
    }
  };

  const handleGoogleFailure = () => {
    alert('Google login failed!');
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
        alert('Email is already in use');
        return;
      } else if (response.data.zodPass === false) {
        alert('Entered Details Do not Match the Criteria');
        return;
      } else if (response.data.serverError) {
        alert('Server Error');
        return;
      }
      navigate('/redirect-verify');
      const interval = setInterval(async () => {
        try {
          const verifiedResponse = await axios.post('http://localhost:8000/isverified', {
            email,
          });
          if (verifiedResponse.data.verified) {
            clearInterval(interval);
            navigate('/dashboard');
          }
        } catch (error) {
          console.error('Error checking verification status', error);
        }
      }, 3000);
    } catch (error) {
      console.log('Error from manual Signup', error);
    }
  }

  return (
    <div
      className="flex items-center justify-center min-h-screen min-w-full  bg-gray-900"
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
