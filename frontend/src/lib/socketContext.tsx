import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '../hooks/useAuth';

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  joinChat: (chatId: number) => void;
  leaveChat: (chatId: number) => void;
  sendMessage: (chatId: number, content: string) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user } = useAuth();

  useEffect(() => {
    // Create socket connection
    const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
      transports: ['websocket', 'polling'],
      auth: {
        token: localStorage.getItem('jwt') || ''
      }
    });

    socketInstance.on('connect', () => {
      console.log('Socket connected');
      setIsConnected(true);
    });

    socketInstance.on('disconnect', () => {
      console.log('Socket disconnected');
      setIsConnected(false);
    });

    // Handle connection error
    socketInstance.on('connect_error', (error) => {
      console.error('Socket connection error:', error);
      setIsConnected(false);
    });

    // Handle authentication error
    socketInstance.on('error', (error) => {
      console.error('Socket error:', error);
    });

    setSocket(socketInstance);

    return () => {
      socketInstance.disconnect();
    };
  }, []);

  const joinChat = (chatId: number) => {
    if (socket && isConnected) {
      socket.emit('join', chatId);
    }
  };

  const leaveChat = (chatId: number) => {
    if (socket && isConnected) {
      socket.emit('leave', chatId);
    }
  };

  const sendMessage = (chatId: number, content: string) => {
    if (socket && isConnected) {
      console.log('Sending message in chat:', chatId);
      
      // No need to send user ID, it will be extracted from JWT on the server
      socket.emit('message:send', {
        chatId,
        content,
      });
    } else {
      console.error('Cannot send message: socket not connected', { 
        socket: !!socket, 
        isConnected
      });
    }
  };

  return (
    <SocketContext.Provider
      value={{
        socket,
        isConnected,
        joinChat,
        leaveChat,
        sendMessage,
      }}
    >
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = (): SocketContextType => {
  const context = useContext(SocketContext);
  if (context === undefined) {
    throw new Error('useSocket must be used within a SocketProvider');
  }
  return context;
}; 