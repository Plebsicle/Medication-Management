import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../lib/socketContext';
import { useAuth } from '../../hooks/useAuth';
import { chatApi } from '../../lib/api/chat';
import ChatMessage from './ChatMessage';
import FileUploader from './FileUploader';
import SharedFilesList from './SharedFilesList';
import { toast } from 'sonner';
import { Send, Loader2 } from 'lucide-react';

interface User {
  id: number;
  name: string;
  profile_photo_path: string | null;
  role: string;
}

interface Message {
  id: number;
  content: string;
  user_id: number;
  chat_id: number;
  created_at: string;
  user: User;
}

interface ChatInfo {
  chat_id: number;
  doctor: {
    id: number;
  };
  patient: {
    id: number;
  };
}

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { socket, isConnected, joinChat, sendMessage } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [fileRefreshTrigger, setFileRefreshTrigger] = useState(0);
  const [chatInfo, setChatInfo] = useState<ChatInfo | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Load initial messages and chat info
  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        try {
          setLoading(true);
          const messagesData = await chatApi.getChatMessages(Number(chatId));
          const chatData = await chatApi.getChatInfo(Number(chatId));
          setMessages(messagesData);
          setChatInfo(chatData);
        } catch (error) {
          console.error('Failed to load messages:', error);
        } finally {
          setLoading(false);
        }
      }
    };
    loadChat();
  }, [chatId]);

  // Join chat room when chat ID changes
  useEffect(() => {
    if (chatId && isConnected) {
      joinChat(Number(chatId));
    }
  }, [chatId, joinChat, isConnected]);

  // Listen for new messages
  useEffect(() => {
    if (socket) {
      const handleNewMessage = (message: Message) => {
        setMessages((prevMessages) => [...prevMessages, message]);
        setIsSending(false);
      };

      const handleMessageError = (error: { error: string }) => {
        console.error('Message error:', error);
        setIsSending(false);
      };

      socket.on('message:receive', handleNewMessage);
      socket.on('message:error', handleMessageError);

      return () => {
        socket.off('message:receive', handleNewMessage);
        socket.off('message:error', handleMessageError);
      };
    }
  }, [socket]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (newMessage.trim() && chatId) {
      setIsSending(true);
      sendMessage(Number(chatId), newMessage.trim());
      setNewMessage('');
      // Blur input on mobile to hide keyboard
      if (window.innerWidth < 768) {
        inputRef.current?.blur();
      }
    }
  };

  const handleFileUploadSuccess = () => {
    toast.success('File uploaded successfully');
    setFileRefreshTrigger(prev => prev + 1);
  };

  const handleFileUploadError = (error: string) => {
    toast.error(error);
  };

  if (loading || !chatInfo) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-8 w-8 sm:h-10 sm:w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Messages Container */}
      <div className="flex-1 overflow-y-auto px-3 py-2 sm:p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500 text-center px-4">
            <div>
              <div className="text-4xl sm:text-6xl mb-4">💬</div>
              <p className="text-sm sm:text-base">No messages yet. Start the conversation!</p>
            </div>
          </div>
        ) : (
          <>
            {messages.map((message) => (
              <ChatMessage
                key={message.id}
                id={message.id}
                content={message.content}
                created_at={message.created_at}
                user={message.user}
                isCurrentUser={!!user && message.user_id === user.id}
              />
            ))}
          </>
        )}
        <div ref={messagesEndRef} />
      </div>
      
      {/* Shared Files List */}
      {chatInfo && (
        <div className="border-t border-gray-200">
          <SharedFilesList 
            doctorId={chatInfo.doctor.id} 
            patientId={chatInfo.patient.id} 
            refreshTrigger={fileRefreshTrigger}
          />
        </div>
      )}
      
      {/* Message Input */}
      <div className="border-t border-gray-200 bg-white px-3 py-3 sm:p-4">
        <form onSubmit={handleSendMessage} className="flex items-end gap-2 sm:gap-3">
          {/* File Uploader */}
          {chatInfo && (
            <div className="flex-shrink-0">
              <FileUploader
                doctorId={chatInfo.doctor.id}
                patientId={chatInfo.patient.id}
                onUploadSuccess={handleFileUploadSuccess}
                onUploadError={handleFileUploadError}
              />
            </div>
          )}
          
          {/* Message Input */}
          <div className="flex-1 relative">
            <input
              ref={inputRef}
              type="text"
              value={newMessage}
              onChange={(e) => setNewMessage(e.target.value)}
              placeholder="Type a message..."
              className="w-full rounded-full border border-gray-300 px-4 py-2.5 sm:py-3 pr-12 text-sm sm:text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
              disabled={isSending}
            />
            
            {/* Send Button - Mobile optimized */}
            <button
              type="submit"
              disabled={!newMessage.trim() || isSending}
              className={`absolute right-1 top-1/2 transform -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full flex items-center justify-center transition-all duration-200 ${
                isSending 
                  ? 'bg-blue-300 cursor-not-allowed' 
                  : newMessage.trim()
                    ? 'bg-blue-500 hover:bg-blue-600 active:bg-blue-700' 
                    : 'bg-gray-300 cursor-not-allowed'
              }`}
            >
              {isSending ? (
                <Loader2 className="h-4 w-4 sm:h-5 sm:w-5 text-white animate-spin" />
              ) : (
                <Send className="h-4 w-4 sm:h-5 sm:w-5 text-white" />
              )}
            </button>
          </div>
        </form>
        
        {/* Connection Status - Mobile */}
        {!isConnected && (
          <div className="mt-2 text-xs text-amber-600 bg-amber-50 px-3 py-2 rounded-lg flex items-center justify-center">
            <div className="h-2 w-2 bg-amber-500 rounded-full mr-2 animate-pulse"></div>
            Reconnecting...
          </div>
        )}
      </div>
    </div>
  );
};

export default ChatWindow;