import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import axios from "axios";

const BACKEND_URL = import.meta.env.VITE_API_URL || `http://localhost:8000`

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [verificationInProgress, setVerificationInProgress] = useState(false); // Ensures no repeated requests

  useEffect(() => {
    const verifyEmail = async () => {
      if (verificationInProgress) return; // Skip if already verifying
      setVerificationInProgress(true);

      const token = searchParams.get("token");
      if (!token) {
        setStatusMessage("Invalid or missing verification token.");
        setLoading(false);
        return;
      }

      console.log("Verification Token:", token);

      try {
        const response = await axios.post(
          `${BACKEND_URL}/verifyEmail?token=${token}`);
        const jwtToken : any = response.data.jwt;
        localStorage.setItem("jwt", jwtToken);
        setStatusMessage("Email verified successfully! This tab will close automatically in a few seconds...");
        setTimeout(() => {
          window.close();
        }, 3000);
      } catch (error: any) {
        console.error("Verification Error:", error);
        setStatusMessage(
          error.response?.data?.message || "Failed to verify email."
        );
      } finally {
        setLoading(false);
      }
    };

    verifyEmail();
  }, [searchParams]); // Dependencies are minimal

  if (loading) {
    return <div>Verifying your email, please wait...</div>;
  }

  return (
    <div>
      <h1>Email Verification</h1>
      <p>{statusMessage}</p>
    </div>
  );
};

export default VerifyEmail;
