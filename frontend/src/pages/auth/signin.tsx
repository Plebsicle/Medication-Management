import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { SimpleAuthLayout } from '@/components/layout/SimpleAuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';
import { ArrowRight, LogIn, Mail, Key, LockKeyhole } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000" 

export default function Signin() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const {refreshUserData} = useAuth();
  // Add animation effect on component mount
  useState(() => {
    setIsVisible(true);
  });

  const handleGoogleSuccess = async (credentialResponse: any) => {
    try {
      const googleToken = credentialResponse.credential;
      const response = await axios.post(`${BACKEND_URL}/signin`, {
        googleId: googleToken,
      });
  
      if (response.data.userFound === false) {
        toast.error("Account does not exist. Please sign up.");
        return;
      }
  
      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
          await refreshUserData();
        if(response.data.role === "doctor"){
          toast.success("Sign In Successful!");
          navigate('/doctorDashboard');
        }
        else{
          toast.success("Sign In Successful!");
          await refreshUserData();
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error in Google Signin:', error);
      toast.error("An error occurred during Google Signin.");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google Login Failed!");
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    try {
      const response = await axios.post(`${BACKEND_URL}/signin`, {
        email,
        password
      });
      // console.log(response);
      if('zodPass' in response.data && !response.data.zodPass){
        toast.error("Invalid email or password");
      }
      if('userFound' in response.data && !response.data.userFound){
        toast.error("User not found Signup first ");
      }
      if('isPasswordSet' in response.data && !response.data.isPasswordSet){
        toast.error("Use forget password to set a password");
      }
      if('isPasswordCorrect' in response.data && !response.data.isPasswordCorrect){
        toast.error("Enter password is incorrect");
      }
      if (response.data.jwt) {
        // console.log("HI from JWT");
        localStorage.setItem('jwt', response.data.jwt);
          await refreshUserData();
        if(response.data.role === "doctor"){
          toast.success("Signed in successfully");
          navigate('/doctorDashboard');
        }
        else{
          toast.success("Signed in successfully");
          navigate('/dashboard');
        }
      }
    } catch (error) {
      console.error('Error signing in:', error);
      toast.error("Invalid email or password");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <SimpleAuthLayout
        title={
          <div className="flex items-center gap-2">
            <span className="text-blue-600">Welcome back</span>
          </div>
        }
        description={
          <div className="text-gray-600">
            Sign in to your MediTrack account
          </div>
        }
        footerText="Don't have an account?"
        footerLink={{
          text: "Sign up",
          href: "/signup"
        }}
      >
        <Card className={`w-full border-0 shadow-lg transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <LogIn className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-600">Sign In</CardTitle>
                <CardDescription>Enter your credentials to access your account</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-gray-700 flex items-center gap-2">
                  <Mail className="h-4 w-4 text-blue-500" />
                  Email
                </Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="Enter your email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="password" className="text-gray-700 flex items-center gap-2">
                  <Key className="h-4 w-4 text-blue-500" />
                  Password
                </Label>
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
              </div>
              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2">
                Sign In
                <ArrowRight className="h-4 w-4" />
              </Button>
            </form>

            <div className="mt-6">
              <div className="relative">
                <div className="absolute inset-0 flex items-center">
                  <Separator className="bg-blue-100" />
                </div>
                <div className="relative flex justify-center text-xs uppercase">
                  <span className="bg-white px-2 text-blue-600">
                    Or continue with
                  </span>
                </div>
              </div>

              <div className="mt-4 flex justify-center [&>div]:!bg-transparent [&>div]:!backdrop-blur-none [&>div]:!shadow-none">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={handleGoogleFailure}
                  theme="outline"
                  text="signin_with"
                  shape="rectangular"
                  width="250"
                />
              </div>
            </div>
          </CardContent>
          <CardFooter className="flex flex-col space-y-2 bg-gray-50 rounded-b-lg">
            <Button
              variant="link"
              className="w-full text-blue-600"
              onClick={() => navigate('/manualEmailVerification')}
            >
              <Mail className="h-4 w-4 mr-2" />
              Verify Email
            </Button>
            <Button
              variant="link"
              className="w-full text-blue-600"
              onClick={() => navigate('/forgetPassword')}
            >
              <LockKeyhole className="h-4 w-4 mr-2" />
              Forgot Password?
            </Button>
          </CardFooter>
        </Card>
      </SimpleAuthLayout>
    </div>
  );
}
