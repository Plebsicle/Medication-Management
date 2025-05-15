import { useEffect, useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { io, Socket } from 'socket.io-client';
import axios from 'axios';

interface Message {
  id?: number;
  content: string;
  is_ai: boolean;
  created_at?: string;
}

const Chatbot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);


  useEffect(() => {
    const token = localStorage.getItem('jwt');
    if (!token) {
      setConnectionError("Authentication required. Please log in.");
      return;
    }

    try {
      const socketInstance = io('http://localhost:8000', {
        reconnectionAttempts: 3,
        timeout: 10000
      });
      setSocket(socketInstance);

      socketInstance.on('connect', () => {
        console.log('Connected to socket server');
        socketInstance.emit('authenticate', token);
      });

      socketInstance.on('authenticated', (data) => {
        if (data.success) {
          setIsConnected(true);
          setConnectionError(null);
          console.log('Authentication successful');
        }
      });

      socketInstance.on('connect_error', (error) => {
        console.error('Socket connection error:', error);
        setConnectionError("Could not connect to server. Server might be down or unavailable.");
        setIsConnected(false);
      });

      socketInstance.on('disconnect', () => {
        setIsConnected(false);
        console.log('Disconnected from socket server');
      });

      socketInstance.on('chat response', (response: string) => {
        setMessages(prev => [...prev, { content: response, is_ai: true }]);
        setIsLoading(false);
      });

      socketInstance.on('error', (error: string) => {
        console.error('Socket error:', error);
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
    } catch (error) {
      console.error('Error initializing socket:', error);
      setConnectionError("Failed to initialize chat connection");
    }
  }, []);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    
    if (!socket || !isConnected) {
      setConnectionError("Not connected to server. Please try refreshing the page.");
      return;
    }

    setMessages(prev => [...prev, { content: input, is_ai: false }]);

    socket.emit('chat message', input);
    setIsLoading(true);
    setInput('');
  };

  return (
    <div className="container mx-auto p-4 max-w-4xl">
      <h1 className="text-2xl font-bold mb-6">Medical Assistant</h1>
      
      <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
        <p className="font-bold">Important Note:</p>
        <p>This AI assistant provides general information only and is not a substitute for professional medical advice. 
        Always consult a healthcare professional for proper medical diagnosis and treatment.</p>
      </div>
      
      {connectionError && (
        <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
          <p className="font-bold">Connection Error:</p>
          <p>{connectionError}</p>
          <p className="mt-2 text-sm">
            Please ensure the server is running and refresh the page. If the issue persists,
            contact support or try again later.
          </p>
        </div>
      )}
      
      <Card className="p-4 mb-4">
        <div className="h-96 overflow-y-auto mb-4">
          {messages.length === 0 ? (
            <div className="text-center text-gray-500 mt-20">
              <p>No messages yet. Ask a medical question to get started.</p>
              <p className="text-sm mt-2">Example: "What could be causing my headache and fever?"</p>
            </div>
          ) : (
            messages.map((message, index) => (
              <div 
                key={message.id || index} 
                className={`mb-4 ${message.is_ai ? 'text-left' : 'text-right'}`}
              >
                <div 
                  className={`inline-block p-3 rounded-lg max-w-[80%] ${
                    message.is_ai 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'bg-green-100 text-green-800'
                  }`}
                >
                  {message.content}
                </div>
              </div>
            ))
          )}
          {isLoading && (
            <div className="text-left mb-4">
              <div className="inline-block p-3 rounded-lg bg-blue-100 text-blue-800">
                <div className="flex space-x-2 items-center">
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                  <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                  <span className="text-sm ml-1">AI is thinking...</span>
                </div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>
        
        <form onSubmit={handleSendMessage} className="flex gap-2">
          <Input
            type="text"
            placeholder={isConnected ? "Type your medical question here..." : "Connecting to server..."}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            disabled={!isConnected || isLoading}
            className="flex-1"
          />
          <Button 
            type="submit" 
            disabled={!isConnected || input.trim() === '' || isLoading}
          >
            {isLoading ? 'Sending...' : 'Send'}
          </Button>
        </form>
      </Card>
    </div>
  );
};

export default Chatbot; 