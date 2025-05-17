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
    // Only connect if user is authenticated
    if (user) {
      const socketInstance = io(import.meta.env.VITE_API_URL || 'http://localhost:8000', {
        transports: ['websocket', 'polling'],
      });

      socketInstance.on('connect', () => {
        console.log('Socket connected');
        setIsConnected(true);
      });

      socketInstance.on('disconnect', () => {
        console.log('Socket disconnected');
        setIsConnected(false);
      });

      setSocket(socketInstance);

      return () => {
        socketInstance.disconnect();
      };
    }
  }, [user]);

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
    if (socket && isConnected && user) {
      socket.emit('message:send', {
        chatId,
        senderId: user.id,
        content,
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