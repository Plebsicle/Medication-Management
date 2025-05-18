import { TextField, Button, Box, Typography } from '@mui/material';
import {  useNavigate } from 'react-router-dom';
import { useState } from 'react';
import axios from 'axios'
import {toast,Bounce} from 'react-toastify'

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"


export default function ForgetPassword(){
    const navigate= useNavigate();
    const [email,setEmail] = useState<String>("");

    async function forgetPasswordHandler(){
        const response = await axios.post(`${BACKEND_URL}/forgetPassword`,{email});
        if(response.data.isEmailSent){
            navigate('/emailSent');
        }
        const channel = new BroadcastChannel('auth_channel');
        channel.onmessage = (event) => {
          if (event.data.type === 'passwordChanged') {
            window.location.href = '/signin';
            toast.success('Password Changed Successfully!', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
            });
          }
        };
    }
    return(
        <div className="flex items-center justify-center min-h-screen pr-36 pt-16"
        style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            minHeight: '80vh',
            width: '88vw',
      }}
        >
        <Box  sx={{
          width: '100%',
          maxWidth: 400,
          bgcolor: 'white',
          p: 4,
          borderRadius: 2,
          boxShadow: 3
        }}>
            <Typography variant="h4" component="h1" gutterBottom align="center">
          Forget Password
        </Typography>
            <form onSubmit={(e) => { e.preventDefault(); forgetPasswordHandler(); }}>
                <TextField label="Email"
                variant="outlined"
                fullWidth
                margin="normal"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}/>
                <Button
                type="submit"
                variant="contained"
                color="primary"
                fullWidth
                sx={{ mt: 2 }}
            >
                Submit
          </Button>
            </form>
        </Box>
        </div>
    )
}