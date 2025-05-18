import { TextField, Button, Box, Typography } from '@mui/material';
import  { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import {toast,Bounce} from 'react-toastify'

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function VerifyEmailManual(){
    const [newEmail, setnewEmail] = useState<string>("");
    const [currentEmail , setcurrentEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    async function manualEmailHandler(){
        try{
            await axios.post(`${BACKEND_URL}/manualEmail`,{oldEmail : currentEmail , newEmail : newEmail,password});
            navigate('/redirect-verify')
            const interval = setInterval(async () => {
                try {
                  const verifiedResponse = await axios.post(`${BACKEND_URL}/isverified`,{
                    newEmail
                  });
                  if (verifiedResponse.data.verified) {
                    clearInterval(interval);
                    toast.success('Email Verified Succesfully!', {
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
                    navigate('/dashboard'); 
                  }
                } catch (error) {
                  console.error("Error checking verification status", error);
                }
              }, 3000);
        }
        catch(e){
            console.log("Error in Manual Email Verification Frontend",e);
             toast.error('Error in Manual Email Verification Frontend!', {
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
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen">
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
          Verify Email
        </Typography>
        <form onSubmit={(e) => { e.preventDefault(); manualEmailHandler(); }}>
          <TextField
            label="New Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={newEmail}
            onChange={(e) => setnewEmail(e.target.value)}
          />
          <TextField
            label="Current Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={currentEmail}
            onChange={(e) => setcurrentEmail(e.target.value)}
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
            Verify Email
          </Button>
          </form>
          
        </Box>
          </div>
    )
}
