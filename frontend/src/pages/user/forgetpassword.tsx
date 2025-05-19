
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast, Bounce } from 'react-toastify';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ForgetPassword() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function forgetPasswordHandler() {
    try {
      setIsLoading(true);
      const response = await axios.post(`${BACKEND_URL}/forgetPassword`, { email });
      
      if (response.data.isEmailSent) {
        navigate('/emailSent');
      }
      
      const channel = new BroadcastChannel('auth_channel');
      channel.onmessage = (event) => {
        if (event.data.type === 'passwordChanged') {
          window.location.href = '/signin';
          toast.success('Password Changed Successfully!', {
            position: "top-center",
            autoClose: 5000,
            theme: "dark",
            transition: Bounce,
          });
        }
      };
    } catch (error) {
      console.error("Error sending password reset email:", error);
      toast.error("Failed to send password reset email. Please try again.");
    } finally {
      setIsLoading(false);
    }
  }

  return (
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12 flex items-center justify-center px-4">
        <div className="w-full max-w-md">
          <Card className="border-0 shadow-lg bg-white overflow-hidden">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardHeader className="text-center">
              <div className="mx-auto bg-blue-100 p-3 rounded-full w-16 h-16 flex items-center justify-center mb-4">
                <Mail className="h-8 w-8 text-blue-600" />
              </div>
              <CardTitle className="text-2xl text-blue-600">Forgot Password</CardTitle>
              <CardDescription>
                Enter your email address and we'll send you a link to reset your password
              </CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={(e) => { e.preventDefault(); forgetPasswordHandler(); }}>
                <div className="mb-4">
                  <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                    placeholder="your@email.com"
                    required
                  />
                </div>
                <Button 
                  type="submit" 
                  className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
                  disabled={isLoading}
                >
                  {isLoading ? "Sending..." : "Send Reset Link"}
                </Button>
              </form>
            </CardContent>
            <CardFooter className="flex justify-center pt-0">
              <button 
                onClick={() => navigate('/signin')} 
                className="text-blue-600 hover:text-blue-800 text-sm font-medium"
              >
                Back to Sign In
              </button>
            </CardFooter>
          </Card>
        </div>
      </main>
  );
}