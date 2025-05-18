import React, { useState, useEffect, useRef } from 'react';
import { useParams } from 'react-router-dom';
import { useSocket } from '../../lib/socketContext';
import { useAuth } from '../../hooks/useAuth';
import { chatApi } from '../../lib/api/chat';
import ChatMessage from './ChatMessage';

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

const ChatWindow: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const { user } = useAuth();
  const { socket, isConnected, joinChat, sendMessage } = useSocket();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Load initial messages
  useEffect(() => {
    const loadChat = async () => {
      if (chatId) {
        try {
          setLoading(true);
          const messagesData = await chatApi.getChatMessages(Number(chatId));
          setMessages(messagesData);
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
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4">
        {messages.length === 0 ? (
          <div className="flex items-center justify-center h-full text-gray-500">
            No messages yet. Start the conversation!
          </div>
        ) : (
          messages.map((message) => (
            <ChatMessage
              key={message.id}
              id={message.id}
              content={message.content}
              created_at={message.created_at}
              user={message.user}
              isCurrentUser={!!user && message.user_id === user.id}
            />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>
      
      <div className="border-t p-4">
        <form onSubmit={handleSendMessage} className="flex">
          <input
            type="text"
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 rounded-l-lg border border-gray-300 px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            type="submit"
            disabled={!newMessage.trim() || isSending}
            className={`text-white rounded-r-lg px-4 py-2 ${
              isSending ? 'bg-blue-300' : 'bg-blue-500 hover:bg-blue-600'
            } disabled:bg-blue-300 transition`}
          >
            {isSending ? 'Sending...' : 'Send'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default ChatWindow; 