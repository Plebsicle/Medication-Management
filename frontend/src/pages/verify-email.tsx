import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import axios from "axios";

const VerifyEmail: React.FC = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const navigate = useNavigate();
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
          `http://localhost:8000/verifyEmail?token=${token}`
        ,{
          Name : "Pravaz"
        });
        const { token: jwtToken } = response.data;

        // Save JWT and redirect
        localStorage.setItem("token", jwtToken);
        setStatusMessage("Email verified successfully! Redirecting...");
        setTimeout(() => {
          navigate("/dashboard");
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
