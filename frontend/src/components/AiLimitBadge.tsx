import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface AiLimitBadgeProps {
  className?: string;
}

const AiLimitBadge: React.FC<AiLimitBadgeProps> = ({ className = '' }) => {
  const [usedPrompts, setUsedPrompts] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const MAX_PROMPTS = 10;

  useEffect(() => {
    const fetchAiUsage = async () => {
      try {
        setLoading(true);
        const token = localStorage.getItem('jwt');
        
        if (!token) {
          setError('Not authenticated');
          return;
        }
        
        const response = await axios.get('http://localhost:8000/chatbot/usage', {
          headers: {
            Authorization: `Bearer ${token}`
          }
        });
        
        if (response.data.success) {
          setUsedPrompts(response.data.aiPromptsCount);
        } else {
          setError('Failed to fetch AI usage');
        }
      } catch (err) {
        console.error('Error fetching AI usage:', err);
        setError('Failed to fetch AI usage');
      } finally {
        setLoading(false);
      }
    };
    
    fetchAiUsage();
  }, []);
  
  if (loading) {
    return <div className={`text-sm ${className}`}>Loading...</div>;
  }
  
  if (error || usedPrompts === null) {
    return null;
  }
  
  const remainingPrompts = MAX_PROMPTS - usedPrompts;
  const isLow = remainingPrompts <= 2;
  
  return (
    <div className={`flex items-center ${className}`}>
      <span className="text-sm mr-2">AI Prompts:</span>
      <span 
        className={`px-2 py-0.5 rounded-full text-xs font-medium ${
          isLow ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
        }`}
      >
        {remainingPrompts} / {MAX_PROMPTS} remaining
      </span>
    </div>
  );
};

export default AiLimitBadge; 