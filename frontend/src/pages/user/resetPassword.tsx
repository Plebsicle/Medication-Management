import { useState, useEffect } from "react";
import axios from "axios";
import { useParams } from "react-router-dom";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Lock } from "lucide-react";

const BACKEND_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

export default function ForgetPassword() {
  const [password, setPassword] = useState("");
  const [isVisible, setIsVisible] = useState(false);
  const { email } = useParams<{ email: string }>();

  useEffect(() => {
    setIsVisible(true);
  }, []);

  async function forgetPasswordHandler() {
    try {
      const response = await axios.put(`${BACKEND_URL}/forgetPassword`, { password, email });
      if (response.data.passwordChanged) {
        toast.success("Password updated successfully");
        const channel = new BroadcastChannel("auth_channel");
        channel.postMessage({ type: "passwordChanged" });
        window.close();
      }
      if (!response.data.zodPass) {
        toast.error("Password does not meet requirements", {
          description: "Please check your password and try again",
        });
      }
    } catch (error) {
      console.error("Error updating password:", error);
      toast.error("Failed to update password");
    }
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white flex items-center justify-center px-4 py-12">
      <div className={`w-full max-w-md transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
        <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden">
          <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
          <CardHeader className="space-y-1">
            <div className="flex justify-center mb-2">
              <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Lock className="h-6 w-6 text-blue-600" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center text-blue-600">Reset Password</CardTitle>
            <CardDescription className="text-center">
              Enter your new password below
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={(e) => { e.preventDefault(); forgetPasswordHandler(); }} className="space-y-4">
              <div className="space-y-2">
                <Input
                  id="password"
                  type="password"
                  placeholder="Enter your new password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="border border-gray-300 rounded-lg"
                />
              </div>
              <Button 
                type="submit" 
                className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl"
              >
                Reset Password
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex justify-center bg-gray-50 text-sm text-gray-600 px-8 py-4">
            Your password should contain at least 8 characters including uppercase, lowercase, numbers, and special characters
          </CardFooter>
        </Card>
      </div>
    </main>
  );
}