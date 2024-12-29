import { TextField, Button, Box, Typography } from '@mui/material';
import  { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';


export default function VerifyEmailManual(){
    const [newEmail, setnewEmail] = useState<string>("");
    const [currentEmail , setcurrentEmail] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const navigate = useNavigate();
    async function manualEmailHandler(){
        try{
            await axios.post('http://localhost:8000/manualEmail',{oldEmail : currentEmail , newEmail : newEmail,password});
            navigate('/redirect-verify')
            const interval = setInterval(async () => {
                try {
                  const verifiedResponse = await axios.post('http://localhost:8000/isverified', {
                    newEmail
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
