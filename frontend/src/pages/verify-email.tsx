import React, { useEffect, useState } from 'react';
import { useLocation } from 'react-router-dom';
import axios from 'axios';

const VerifyEmail: React.FC = () => {
  const [message, setMessage] = useState<string>('Verifying...');
  const location = useLocation();

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const token = params.get('token');

    if (token) {
      axios
        .get<{ message: string }>(`http://localhost:8000/verify-email`, {
          params: { token },
        })
        .then((response) => {
          setMessage(response.data.message);
        })
        .catch((error) => {
          setMessage('Verification failed. Token may be expired or invalid.');
        });
    } else {
      setMessage('No token provided.');
    }
  }, [location.search]);

  return <div>{message}</div>;
};

export default VerifyEmail;
