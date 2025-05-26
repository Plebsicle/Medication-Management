import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ChatWindow from '../../components/chat/ChatWindow';
import { chatApi } from '../../lib/api/chat';
import { useAuth } from '../../hooks/useAuth';
import { AppLayout } from '@/components/layout/AppLayout';
import { ArrowLeft, Stethoscope } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface Chat {
  chat_id: number;
  patient: {
    id: number;
    name: string;
    profile_photo_path: string | null;
  };
}

const DoctorChat: React.FC = () => {
  const { chatId } = useParams<{ chatId: string }>();
  const [chat, setChat] = useState<Chat | null>(null);
  const [loading, setLoading] = useState(true);
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();
  const { loading: authLoading } = useAuth();

  useEffect(() => {
    setIsVisible(true);
    const loadChat = async () => {
      if (!chatId) return;
      
      try {
        setLoading(true);
        // Get all chats and find the current one
        const chats = await chatApi.getUserChats();
        const currentChat = chats.find((c: Chat) => c.chat_id === Number(chatId));
        
        if (!currentChat) {
          navigate('/doctor/chats');
          return;
        }
        
        setChat(currentChat);
      } catch (error) {
        console.error('Failed to load chat:', error);
      } finally {
        setLoading(false);
      }
    };

    if (!authLoading) {
      loadChat();
    }
  }, [chatId, navigate, authLoading]);

  if (authLoading || loading) {
    return (
      <AppLayout>
        <div className="flex items-center justify-center h-screen bg-gradient-to-b from-blue-50 to-white">
          <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      </AppLayout>
    );
  }

  if (!chat) {
    return null;
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-4 sm:pb-12">
        {/* Header Section */}
        <section className={`relative pt-4 sm:pt-8 pb-4 sm:pb-6 px-3 sm:px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex items-center mb-4 sm:mb-6">
              <Button 
                variant="ghost" 
                size="sm"
                className="mr-2 sm:mr-4 rounded-full hover:bg-blue-100 text-blue-600 p-2"
                onClick={() => navigate('/doctor/chats')}
              >
                <ArrowLeft className="h-4 w-4 sm:h-5 sm:w-5" />
              </Button>
              <div className="flex items-center min-w-0 flex-1">
                <div className="h-10 w-10 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-blue-100 shadow-md mr-3 sm:mr-4 flex-shrink-0">
                  <img
                    src={chat.patient.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                    alt={chat.patient.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <h1 className="text-lg sm:text-xl font-bold text-gray-900 truncate">{chat.patient.name}</h1>
                  <div className="flex items-center text-gray-600 mt-1">
                    <span className="flex items-center text-xs sm:text-sm bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full">
                      <Stethoscope className="h-3 w-3 mr-1 flex-shrink-0" />
                      <span className="whitespace-nowrap">Patient</span>
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Chat Section */}
        <div className={`px-3 sm:px-4 md:container md:mx-auto transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="bg-white rounded-xl sm:rounded-2xl shadow-lg overflow-hidden border border-gray-100">
            <div className="flex-1 h-[calc(100vh-140px)] sm:h-[calc(75vh)] min-h-[400px]">
              <ChatWindow />
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default DoctorChat;