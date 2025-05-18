import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../lib/api/chat';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';

interface Chat {
  chat_id: number;
  patient: {
    id: number;
    name: string;
    profile_photo_path: string | null;
  };
  chatMessages: any[];
  updated_at: string;
}

const DoctorChatList: React.FC = () => {
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadChats = async () => {
      try {
        setLoading(true);
        const chatsData = await chatApi.getUserChats();
        setChats(chatsData);
      } catch (error) {
        console.error('Failed to load chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <div className="container mx-auto p-4 max-w-3xl">
        <h1 className="text-2xl font-bold mb-6">Patient Consultations</h1>
        
        <div className="bg-white rounded-lg shadow overflow-hidden">
          {chats.length === 0 ? (
            <div className="p-8 text-center text-gray-500">
              <p className="mb-2">No patient consultations yet.</p>
              <p className="text-sm">Patients will initiate chats with you when they need your assistance.</p>
            </div>
          ) : (
            <div className="divide-y">
              {chats.map((chat) => (
                <Link
                  key={chat.chat_id}
                  to={`/doctor/chat/${chat.chat_id}`}
                  className="p-4 flex items-center hover:bg-gray-50 transition"
                >
                  <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                    <img
                      src={chat.patient.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                      alt={chat.patient.name}
                      className="h-full w-full object-cover"
                    />
                  </div>
                  <div className="flex-1">
                    <h3 className="font-medium">{chat.patient.name}</h3>
                    <p className="text-sm text-gray-500 truncate">
                      {chat.chatMessages.length > 0
                        ? chat.chatMessages[0].content
                        : 'No messages yet'}
                    </p>
                  </div>
                  <div className="text-xs text-gray-500">
                    {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>
    </AppLayout>
  );
};

export default DoctorChatList; 