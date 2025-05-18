import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { toast } from 'sonner';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000"

interface PhoneVerificationProps {
  googleData: {
    email: string;
    name: string;
    googleId: string;
    role: string;
  };
  onClose: () => void;
}

export function PhoneVerification({ googleData, onClose }: PhoneVerificationProps) {
  const [phoneNumber, setPhoneNumber] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!phoneNumber.trim()) {
      toast.error("Error", {
        description: "Phone number is required"
      });
      return;
    }
    
    setIsSubmitting(true);
    
    try {
      const response = await axios.post(`${BACKEND_URL}/signup/google-phone`, {
        ...googleData,
        phone_number: phoneNumber
      });
      
      if (response.data.jwt) {
        localStorage.setItem('jwt', JSON.stringify(response.data.jwt));
        toast.success("Success", {
          description: "Phone number verified successfully!"
        });
        navigate('/dashboard');
      }
    } catch (error) {
      console.error('Phone verification error:', error);
      toast.error("Error", {
        description: "Failed to verify phone number. Please try again."
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50">
      <Card className="w-[400px] max-w-[90%]">
        <CardHeader>
          <CardTitle>Phone Verification Required</CardTitle>
          <CardDescription>
            Please enter your phone number to complete the signup process
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
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
            
            <div className="flex justify-end space-x-2">
              <Button 
                type="button" 
                variant="outline" 
                onClick={onClose}
                disabled={isSubmitting}
              >
                Cancel
              </Button>
              <Button 
                type="submit"
                disabled={isSubmitting}
              >
                {isSubmitting ? "Verifying..." : "Verify"}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 