import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../../components/chat/ChatWindow';
import { chatApi } from '../../lib/api/chat';

interface Chat {
  chat_id: number;
  doctor: {
    id: number;
    name: string;
    profile_photo_path: string | null;
  };
}

const PatientChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const loadChat = async () => {
      if (!chatId) return;
      
      try {
        setLoading(true);
        // Get all chats and find the current one
        const chats = await chatApi.getUserChats();
        const currentChat = chats.find((c: Chat) => c.chat_id === Number(chatId));
        
        if (!currentChat) {
          navigate('/patient/chats');
          return;
        }
        
        setChat(currentChat);
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChat();
  }, [chatId, navigate]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (!chat) {
    return null;
  }

  return (
    <div className="flex flex-col h-screen">
      <header className="bg-white shadow">
        <div className="flex items-center justify-between p-4">
          <div className="flex items-center">
            <button
              onClick={() => navigate('/patient/chats')}
              className="mr-4 text-gray-500 hover:text-gray-700"
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
              </svg>
            </button>
            <div className="flex items-center">
              <div className="h-10 w-10 rounded-full overflow-hidden bg-gray-200 mr-3">
                <img
                  src={chat.doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                  alt={chat.doctor.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h1 className="text-lg font-medium">{chat.doctor.name}</h1>
                <p className="text-xs text-gray-500">Doctor</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      <div className="flex-1 overflow-hidden">
        <ChatWindow />
      </div>
    </div>
  );
};

export default PatientChat; 