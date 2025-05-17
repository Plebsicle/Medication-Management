import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { GoogleLogin } from '@react-oauth/google';
import axios from 'axios';
import { SimpleAuthLayout } from '@/components/layout/SimpleAuthLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { PhoneVerification } from '@/components/PhoneVerification';

type Role = 'patient' | 'caregiver' | 'doctor';

interface GoogleData {
  email: string;
  name: string;
  googleId: string;
  role: string;
}

export default function Signup() {
  const [name, setName] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [password, setPassword] = useState<string>('');
  const [phoneNumber, setPhoneNumber] = useState<string>('');
  const [role, setRole] = useState<Role>('patient');
  const [showPhoneVerification, setShowPhoneVerification] = useState(false);
  const [googleData, setGoogleData] = useState<GoogleData | null>(null);
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
        toast.success("Sign Up Successful!");
        navigate('/dashboard');
      } else if (response.data.requirePhoneNumber) {
        // Show phone verification popup
        setGoogleData(response.data.googleData);
        setShowPhoneVerification(true);
      } else if (response.data.EmailinUse) {
        toast.error("Email is already in use!");
      } else if (!response.data.validDetails) {
        toast.error("Invalid Google Credentials!");
      }
    } catch (error) {
      toast.error("Error during Google signup!");
    }
  };

  const handleGoogleFailure = () => {
    toast.error("Google login failed!");
  };

  async function manualSignuphandler() {
    try {
      const response = await axios.post('http://localhost:8000/signup', {
        name,
        email,
        password,
        role,
        phone_number: phoneNumber,
      });

      if (response.data.EmailinUse) {
        toast.error("Email is already in use!");
      } else if (!response.data.isEmailVerified) {
        toast.info("Verification email sent. Please check your inbox.");
        navigate('/redirect-verify');
        const interval = setInterval(async () => {
          try {
            const verifiedResponse = await axios.post('http://localhost:8000/isverified', {
              email,
            });
            if (verifiedResponse.data.verified) {
              clearInterval(interval);
              toast.success("Email Verified! Redirecting to Dashboard...");
              navigate('/dashboard');
            }
          } catch (error) {
            console.error('Error checking verification status', error);
          }
        }, 3000);
      } else if (!response.data.zodPass) {
        toast.error("Entered Details Do Not Match the Criteria!");
      } else if (response.data.serverError) {
        toast.error("Server Error! Please try again later.");
      } 
    } catch (error) {
      toast.error("Error during manual signup!");
    }
  }

  return (
    <SimpleAuthLayout
      title="Create an account"
      description="Sign up to get started"
      footerText="Already have an account?"
      footerLink={{
        text: "Sign in",
        href: "/signin"
      }}
    >
      {showPhoneVerification && googleData && (
        <PhoneVerification 
          googleData={googleData} 
          onClose={() => setShowPhoneVerification(false)} 
        />
      )}
      
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Sign Up</CardTitle>
          <CardDescription>Fill in your details to create an account</CardDescription>
        </CardHeader>
        <CardContent>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              manualSignuphandler();
            }}
            className="space-y-4"
          >
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                type="text"
                placeholder="Enter your name"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

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
                placeholder="Create a password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phoneNumber">Phone Number</Label>
              <Input
                id="phoneNumber"
                type="tel"
                placeholder="+1 (555) 123-4567"
                value={phoneNumber}
                onChange={(e) => setPhoneNumber(e.target.value)}
                required
              />
              <p className="text-xs text-gray-500">
                Please include your country code (e.g., +1 for US)
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Role</Label>
              <Select
                value={role}
                onValueChange={(value) => setRole(value as Role)}
              >
                <SelectTrigger id="role">
                  <SelectValue placeholder="Select a role" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="patient">Patient</SelectItem>
                  <SelectItem value="caregiver">Caregiver</SelectItem>
                  <SelectItem value="doctor">Doctor</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <Button type="submit" className="w-full">
              Sign Up
            </Button>
          </form>

          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <Separator />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-background px-2 text-muted-foreground">
                  Or sign up with
                </span>
              </div>
            </div>

            <div className="mt-4 flex justify-center [&>div]:!bg-transparent [&>div]:!backdrop-blur-none [&>div]:!shadow-none">
              <GoogleLogin
                onSuccess={handleGoogleSuccess}
                onError={handleGoogleFailure}
                theme="outline"
                text="continue_with"
                shape="rectangular"
                width="250"
              />
            </div>
          </div>
        </CardContent>
      </Card>
    </SimpleAuthLayout>
  );
}