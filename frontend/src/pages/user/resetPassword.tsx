import { TextField, Button, Box, Typography } from '@mui/material';
import { useState } from 'react';
import axios from 'axios'
import {useParams} from 'react-router-dom'
import {toast,Bounce} from 'react-toastify'

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/"

export default function ForgetPassword(){

    const [password,setPassword] = useState<String>("");
    const { email } = useParams<{ email: string }>();

    async function forgetPasswordHandler(){
        const response = await axios.put(`${BACKEND_URL}/forgetPassword`,{password,email});
        if(response.data.passwordChanged){
            const channel = new BroadcastChannel('auth_channel');
            channel.postMessage({ type: 'passwordChanged' });
            window.close();
        }
        if(!response.data.zodPass){
            toast.error('Password is of incorrect type !', {position: "top-center",autoClose: 5000,theme: "dark",transition: Bounce,
            });
        }
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
                <TextField label="Password"
                variant="outlined"
                fullWidth
                margin="normal"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}/>
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