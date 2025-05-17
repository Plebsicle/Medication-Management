import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
// import { toast, Bounce } from 'react-toastify';
import { SimpleAuthLayout } from '@/components/layout/SimpleAuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { toast } from 'sonner';

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
        toast.error("Account does not exist. Please sign up.");
        return;
      }
  
      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        // console.log(response.data);
        console.log(response.data.role === "doctor");
        if(response.data.role === "doctor"){
          toast.success("Sign In Successful!");
          navigate('/doctorDashboard');
        }
        else{
          toast.success("Sign In Successful!");
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
      const response = await axios.post('http://localhost:8000/signin', {
        email,
        password
      });

      if (response.data.token) {
        localStorage.setItem('jwt', response.data.token);
        
        // Store user data including role
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
    <SimpleAuthLayout
      title="Welcome back"
      description="Sign in to your account"
      footerText="Don't have an account?"
      footerLink={{
        text: "Sign up",
        href: "/signup"
      }}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign In</CardTitle>
          <CardDescription>Enter your credentials to access your account</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Password</Label>
              <Input
                id="password"
                type="password"
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button type="submit" className="w-full">
              Sign In
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
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
        <CardFooter className="flex flex-col space-y-2">
          <Button
            variant="link"
            className="w-full"
            onClick={() => navigate('/manualEmailVerification')}
          >
            Verify Email
          </Button>
          <Button
            variant="link"
            className="w-full"
            onClick={() => navigate('/forgetPassword')}
          >
            Forgot Password?
          </Button>
        </CardFooter>
      </Card>
    </SimpleAuthLayout>
  );
}