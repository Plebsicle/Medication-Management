import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { chatApi } from '../../lib/api/chat';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { MessageSquare, ArrowRight, Stethoscope, PlusCircle } from "lucide-react";

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
  const [isVisible, setIsVisible] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    setIsVisible(true);
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
        <Card className="text-center p-4 sm:p-8 border-0 shadow-md bg-white">
          <CardContent>
            <p className="text-gray-500 text-sm sm:text-base">No doctors available at the moment.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
            <CardHeader className="pb-2 p-4 sm:p-6">
              <div className="flex items-center space-x-3 sm:space-x-4">
                <div className="h-12 w-12 sm:h-16 sm:w-16 rounded-full overflow-hidden bg-blue-100 shadow-inner flex-shrink-0">
                  <img
                    src={doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <CardTitle className="text-lg sm:text-xl text-blue-600 truncate">{doctor.name}</CardTitle>
                  <CardDescription className="text-gray-600 text-sm truncate">{doctor.doctor?.speciality || 'Doctor'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-2 sm:pt-4 p-4 sm:p-6 flex flex-col sm:flex-row justify-between gap-3">
              <Button 
                onClick={() => handleStartChat(doctor.id)} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center justify-center gap-2 flex-1 sm:flex-none"
                size="sm"
              >
                <MessageSquare className="h-4 w-4" />
                <span className="text-sm">Start Chat</span>
              </Button>
              <Button 
                variant="outline" 
                className="border-blue-300 text-blue-600 rounded-xl flex-1 sm:flex-none"
                size="sm"
              >
                <Stethoscope className="h-4 w-4 mr-2" />
                <span className="text-sm">View Profile</span>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    );
  };

  const renderChatsList = () => {
    if (chats.length === 0) {
      return (
        <Card className="text-center p-4 sm:p-8 border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-lg sm:text-xl text-blue-600">No Active Consultations</CardTitle>
            <CardDescription className="text-sm sm:text-base">
              You haven't started any chats yet. Connect with a doctor to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center my-4 sm:my-6">
              <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('doctors')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2 w-full sm:w-auto"
              size="sm"
            >
              <PlusCircle className="h-4 w-4" />
              <span className="text-sm">Find a Doctor</span>
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-3 sm:space-y-4">
        {chats.map((chat) => (
          <Card key={chat.chat_id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
            <Link
              to={`/patient/chat/${chat.chat_id}`}
              className="block"
            >
              <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-3 sm:p-4 flex items-center">
                <div className="h-12 w-12 sm:h-14 sm:w-14 rounded-full overflow-hidden bg-blue-100 mr-3 sm:mr-4 shadow-inner flex-shrink-0">
                  <img
                    src={chat.doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                    alt={chat.doctor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-medium text-blue-600 text-sm sm:text-base truncate">{chat.doctor.name}</h3>
                  <p className="text-xs sm:text-sm text-gray-600 truncate mt-1">
                    {chat.chatMessages.length > 0
                      ? chat.chatMessages[0].content
                      : 'No messages yet'}
                  </p>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full whitespace-nowrap ml-2">
                  {format(new Date(chat.updated_at), 'MMM d, h:mm a')}
                </div>
              </div>
            </Link>
          </Card>
        ))}
      </div>
    );
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-6 sm:pb-12">
        {/* Hero Section */}
        <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-3 sm:px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center text-center lg:text-left">
              <div className="lg:w-1/2 space-y-3 sm:space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                  Doctor Consultations
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Connect with <span className="text-blue-600">Healthcare Professionals</span>
                </h1>
                <p className="text-sm sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                  Get personalized medical advice and guidance from licensed doctors through secure chat consultations.
                </p>
              </div>
              <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                <div className="relative w-48 sm:w-64 md:w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className={`container mx-auto px-3 sm:px-4 max-w-6xl transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-md mb-6 sm:mb-8 overflow-hidden">
            <div className="flex border-b">
              <button
                className={`flex-1 py-3 sm:py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'chats' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('chats')}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline">My Consultations</span>
                  <span className="xs:hidden">Chats</span>
                </div>
              </button>
              <button
                className={`flex-1 py-3 sm:py-4 font-medium text-sm sm:text-base transition-colors ${
                  activeTab === 'doctors' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('doctors')}
              >
                <div className="flex items-center justify-center gap-2">
                  <Stethoscope className="h-4 w-4 sm:h-5 sm:w-5" />
                  <span className="hidden xs:inline">Find Doctors</span>
                  <span className="xs:hidden">Doctors</span>
                </div>
              </button>
            </div>
          </div>
          
          <div className={`transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center mb-4 sm:mb-6">
              <h2 className="text-lg sm:text-2xl font-semibold text-gray-900">
                {activeTab === 'doctors' ? 'Available Doctors' : 'My Consultations'}
              </h2>
              <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
            </div>
            
            {activeTab === 'doctors' ? renderDoctorsList() : renderChatsList()}
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default PatientChatList;