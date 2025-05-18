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
        <Card className="text-center p-8 border-0 shadow-md bg-white">
          <CardContent>
            <p className="text-gray-500">No doctors available at the moment.</p>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {doctors.map((doctor) => (
          <Card key={doctor.id} className="border-0 shadow-md hover:shadow-xl transition-all duration-300 bg-white">
            <CardHeader className="pb-2">
              <div className="flex items-center space-x-4">
                <div className="h-16 w-16 rounded-full overflow-hidden bg-blue-100 shadow-inner">
                  <img
                    src={doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                    alt={doctor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div>
                  <CardTitle className="text-xl text-blue-600">{doctor.name}</CardTitle>
                  <CardDescription className="text-gray-600">{doctor.doctor?.speciality || 'Doctor'}</CardDescription>
                </div>
              </div>
            </CardHeader>
            <CardContent className="pt-4 flex justify-between">
              <Button 
                onClick={() => handleStartChat(doctor.id)} 
                className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
              >
                <MessageSquare className="h-4 w-4" />
                Start Chat
              </Button>
              <Button variant="outline" className="border-blue-300 text-blue-600 rounded-xl">
                <Stethoscope className="h-4 w-4 mr-2" />
                View Profile
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
        <Card className="text-center p-8 border-0 shadow-md bg-white">
          <CardHeader>
            <CardTitle className="text-xl text-blue-600">No Active Consultations</CardTitle>
            <CardDescription>
              You haven't started any chats yet. Connect with a doctor to get started.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex justify-center my-6">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                <MessageSquare className="h-8 w-8 text-blue-500" />
              </div>
            </div>
            <Button 
              onClick={() => setActiveTab('doctors')} 
              className="mt-4 bg-blue-600 hover:bg-blue-700 text-white rounded-xl flex items-center gap-2"
            >
              <PlusCircle className="h-4 w-4" />
              Find a Doctor
              <ArrowRight className="ml-1 h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      );
    }

    return (
      <div className="space-y-4">
        {chats.map((chat) => (
          <Card key={chat.chat_id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
            <Link
              to={`/patient/chat/${chat.chat_id}`}
              className="block"
            >
              <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
              <div className="p-4 flex items-center">
                <div className="h-14 w-14 rounded-full overflow-hidden bg-blue-100 mr-4 shadow-inner">
                  <img
                    src={chat.doctor.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                    alt={chat.doctor.name}
                    className="h-full w-full object-cover"
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-medium text-blue-600">{chat.doctor.name}</h3>
                  <p className="text-sm text-gray-600 truncate">
                    {chat.chatMessages.length > 0
                      ? chat.chatMessages[0].content
                      : 'No messages yet'}
                  </p>
                </div>
                <div className="text-xs text-gray-500 bg-blue-50 px-2 py-1 rounded-full">
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
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Hero Section */}
        <section className={`relative pt-8 pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center">
              <div className="lg:w-1/2 space-y-4">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-4 py-1 text-sm font-medium mb-2">
                  Doctor Consultations
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Connect with <span className="text-blue-600">Healthcare Professionals</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  Get personalized medical advice and guidance from licensed doctors through secure chat consultations.
                </p>
              </div>
              <div className="lg:w-1/2 mt-6 lg:mt-0 flex justify-center">
                <div className="relative w-full max-w-md aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-32 w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-16 w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
        
        <div className={`container mx-auto px-4 max-w-6xl transition-all duration-700 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          {/* Tab Navigation */}
          <div className="bg-white rounded-xl shadow-md mb-8 overflow-hidden">
            <div className="flex border-b">
              <button
                className={`flex-1 py-4 font-medium ${
                  activeTab === 'chats' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('chats')}
              >
                <div className="flex items-center justify-center gap-2">
                  <MessageSquare className="h-5 w-5" />
                  My Consultations
                </div>
              </button>
              <button
                className={`flex-1 py-4 font-medium ${
                  activeTab === 'doctors' 
                    ? 'text-blue-600 border-b-2 border-blue-600' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
                onClick={() => setActiveTab('doctors')}
              >
                <div className="flex items-center justify-center gap-2">
                  <Stethoscope className="h-5 w-5" />
                  Find Doctors
                </div>
              </button>
            </div>
          </div>
          
          <div className={`transition-all duration-500 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">
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
