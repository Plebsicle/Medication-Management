import { useState, useEffect } from 'react';
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
import { UserPlus, Mail, User, Phone, Key, UserCog, ArrowRight } from 'lucide-react';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

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
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  const handleGoogleSuccess = async (credentialResponse: { credential?: string }) => {
    try {
      const googleToken = credentialResponse.credential;
      const response = await axios.post(`${BACKEND_URL}/signup`, {
        googleId: googleToken,
        role,
      });

      if (response.data.jwt) {
        localStorage.setItem('jwt', response.data.jwt);
        
        if(response.data.role === "doctor"){
          toast.success("Sign Up Successful!");
          navigate('/doctorDashboard');
        }
        else{
          toast.success("Sign Up Successful!");
          navigate('/dashboard');
        }
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
      const response = await axios.post(`${BACKEND_URL}/signup`, {
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
            const verifiedResponse = await axios.post(`${BACKEND_URL}/isverified`, {
              email,
            });
            if (verifiedResponse.data.verified) {
              clearInterval(interval);
              if(verifiedResponse.data.role === "doctor"){
                toast.success("Email Verified! Redirecting to Dashboard...");
                navigate('/doctorDashboard');
              }
              else{
                toast.success("Email Verified! Redirecting to Dashboard...");
                navigate('/dashboard');
              }
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
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex flex-col">
      <SimpleAuthLayout
        title={
          <div className="flex items-center gap-2">
            <span className="text-blue-600">Create an account</span>
          </div>
        }
        description={
          <div className="text-gray-600">
            Join MediTrack to manage your health journey
          </div>
        }
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
        
        <Card className={`w-full border-0 shadow-lg transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="h-8 w-8 bg-blue-100 rounded-full flex items-center justify-center">
                <UserPlus className="h-4 w-4 text-blue-600" />
              </div>
              <div>
                <CardTitle className="text-2xl text-blue-600">Sign Up</CardTitle>
                <CardDescription>Fill in your details to create an account</CardDescription>
              </div>
            </div>
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
                <Label htmlFor="name" className="text-gray-700 flex items-center gap-2">
                  <User className="h-4 w-4 text-blue-500" />
                  Name
                </Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="Enter your name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
              </div>

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
                  placeholder="Create a password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="phoneNumber" className="text-gray-700 flex items-center gap-2">
                  <Phone className="h-4 w-4 text-blue-500" />
                  Phone Number
                </Label>
                <Input
                  id="phoneNumber"
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  required
                  className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg"
                />
                <p className="text-xs text-gray-500 pl-6">
                  Please include your country code (e.g., +1 for US)
                </p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="role" className="text-gray-700 flex items-center gap-2">
                  <UserCog className="h-4 w-4 text-blue-500" />
                  Role
                </Label>
                <Select
                  value={role}
                  onValueChange={(value) => setRole(value as Role)}
                >
                  <SelectTrigger id="role" className="border-blue-100 focus:border-blue-300 focus:ring focus:ring-blue-200 focus:ring-opacity-50 rounded-lg">
                    <SelectValue placeholder="Select a role" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="patient">Patient</SelectItem>
                    <SelectItem value="caregiver">Caregiver</SelectItem>
                    <SelectItem value="doctor">Doctor</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2">
                Create Account
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
    </div>
  );
}