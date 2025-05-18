import { TextField, Button, Box, Typography } from '@mui/material';
import  { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

export default function VerifyEmailManual(){
    const [email, setEmail] = useState<string>("");
    const navigate = useNavigate();
    async function manualEmailHandler(){
        try{
            await axios.post(`${BACKEND_URL}/manualEmail`,{email});
            navigate('/redirect-verify')
            const interval = setInterval(async () => {
                try {
                  const verifiedResponse = await axios.post(`${BACKEND_URL}/isverified`, {
                    email
                  });
                  if (verifiedResponse.data.verified) {
                    clearInterval(interval);
                    navigate('/dashboard'); 
                  }
                } catch (error) {
                  console.error("Error checking verification status", error);
                }
              }, 3000);

        }
        catch(e){
            console.log("Error in Manual Email Verification Frontend",e);
        }
    }
    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
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
            label="Email"
            variant="outlined"
            fullWidth
            margin="normal"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
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
