import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatApi } from '../../lib/api/chat';
import { format } from 'date-fns';

interface Doctor {
  id: number;
  name: string;
  profile_photo_path: string | null;
  doctor: {
    speciality: string;
  };
}

interface Chat {
  chat_id: number;
  doctor: {
    id: number;
    name: string;
    profile_photo_path: string | null;
  };
  chatMessages: any[];
  updated_at: string;
}

const PatientChatList: React.FC = () => {
  const [doctors, setDoctors] = useState<Doctor[]>([]);
  const [chats, setChats] = useState<Chat[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'doctors' | 'chats'>('chats');
  const navigate = useNavigate();

  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        const [chatsData, doctorsData] = await Promise.all([
          chatApi.getUserChats(),
          chatApi.getAvailableDoctors(),
        ]);
        setChats(chatsData);
        setDoctors(doctorsData);
      } catch (error) {
        console.error('Failed to load data:', error);
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  const handleStartChat = async (doctorId: number) => {
    try {
      const { chatId } = await chatApi.initiateChat(doctorId);
      navigate(`/patient/chat/${chatId}`);
    } catch (error) {
      console.error('Failed to start chat:', error);
    }
  };

  const renderDoctorsList = () => {
    if (doctors.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          No doctors available at the moment.
        </div>
      );
    }

    return (
      <div className="divide-y">
        {doctors.map((doctor) => (
          <div key={doctor.id} className="p-4 flex items-center justify-between">
            <div className="flex items-center">
              <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
                <img
                  src={doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                  alt={doctor.name}
                  className="h-full w-full object-cover"
                />
              </div>
              <div>
                <h3 className="font-medium">{doctor.name}</h3>
                <p className="text-sm text-gray-500">{doctor.doctor?.speciality || 'Doctor'}</p>
              </div>
            </div>
            <button
              onClick={() => handleStartChat(doctor.id)}
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
            >
              Chat
            </button>
          </div>
        ))}
      </div>
    );
  };

  const renderChatsList = () => {
    if (chats.length === 0) {
      return (
        <div className="p-4 text-center text-gray-500">
          You haven't started any chats yet. Find a doctor to chat with.
        </div>
      );
    }

    return (
      <div className="divide-y">
        {chats.map((chat) => (
          <Link
            key={chat.chat_id}
            to={`/patient/chat/${chat.chat_id}`}
            className="p-4 flex items-center hover:bg-gray-50 transition"
          >
            <div className="h-12 w-12 rounded-full overflow-hidden bg-gray-200 mr-4">
              <img
                src={chat.doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                alt={chat.doctor.name}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex-1">
              <h3 className="font-medium">{chat.doctor.name}</h3>
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
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full p-8">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-4 max-w-3xl">
      <h1 className="text-2xl font-bold mb-6">Doctor Consultations</h1>
      
      <div className="bg-white rounded-lg shadow overflow-hidden mb-8">
        <div className="flex border-b">
          <button
            className={`flex-1 py-3 font-medium ${
              activeTab === 'chats' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('chats')}
          >
            My Chats
          </button>
          <button
            className={`flex-1 py-3 font-medium ${
              activeTab === 'doctors' ? 'text-blue-500 border-b-2 border-blue-500' : 'text-gray-500'
            }`}
            onClick={() => setActiveTab('doctors')}
          >
            Find Doctors
          </button>
        </div>
        
        {activeTab === 'doctors' ? renderDoctorsList() : renderChatsList()}
      </div>
    </div>
  );
};

export default PatientChatList; 