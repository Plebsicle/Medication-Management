import { useEffect, useRef, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

export interface Message {
  id?: number;
  content: string;
  is_ai: boolean;
  created_at?: string;
}

interface UseChatSocketReturn {
  messages: Message[];
  sendMessage: (msg: string) => void;
  isConnected: boolean;
  isLoading: boolean;
  limitReached: boolean;
  connectionError: string | null;
}

export function useChatSocket(): UseChatSocketReturn {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [limitReached, setLimitReached] = useState(false);
  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setConnectionError("Authentication required. Please log in.");
      return;
    }

    const socketInstance = io('http://localhost:8000', {
      reconnectionAttempts: 3,
      timeout: 10000
    });

    socketRef.current = socketInstance;

    socketInstance.on('connect', () => {
      socketInstance.emit('authenticate', token);
    });

    socketInstance.on('authenticated', (data) => {
      if (data.success) {
        setIsConnected(true);
        setConnectionError(null);
      }
    });

    socketInstance.on('connect_error', () => {
      setConnectionError("Could not connect to server. Server might be down or unavailable.");
      setIsConnected(false);
    });

    socketInstance.on('disconnect', () => {
      setIsConnected(false);
    });

    socketInstance.on('chat response', (response: string) => {
      setMessages(prev => [...prev, { content: response, is_ai: true }]);
      setIsLoading(false);
    });

    socketInstance.on('limit reached', (data: { error: string; message: string }) => {
      setLimitReached(true);
      setConnectionError(data.message);
      setIsLoading(false);
    });

    socketInstance.on('error', (error: string) => {
      setConnectionError(error);
      setIsLoading(false);
    });

    const fetchChatHistory = async () => {
      try {
        const response = await axios.post('http://localhost:8000/chatbot/history', { token });
        if (response.data.success) {
          setMessages(response.data.data);
        }
      } catch (error) {
        console.error('Failed to fetch chat history:', error);
      }
    };

    fetchChatHistory();

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const sendMessage = (msg: string) => {
    if (!socketRef.current || !isConnected || limitReached) return;

    setMessages(prev => [...prev, { content: msg, is_ai: false }]);
    socketRef.current.emit('chat message', msg);
    setIsLoading(true);
  };

  return {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    limitReached,
    connectionError
  };
}
