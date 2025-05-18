import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { chatApi } from '../../lib/api/chat';
import { format } from 'date-fns';
import { AppLayout } from '@/components/layout/AppLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { MessageSquare, Clock, Calendar, FileText } from "lucide-react";

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
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
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
                  Doctor Dashboard
                </div>
                <h1 className="text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Manage your <span className="text-blue-600">Patient Consultations</span>
                </h1>
                <p className="text-lg text-gray-600 max-w-xl">
                  View and respond to patient inquiries, provide medical advice, and track your consultation history.
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
          {/* Patient Consultations Section */}
          <div className="flex items-center mb-6">
            <h2 className="text-2xl font-semibold text-gray-900">Active Patient Consultations</h2>
            <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
          </div>
          
          {chats.length === 0 ? (
            <Card className="text-center p-8 border-0 shadow-md bg-white">
              <CardHeader>
                <CardTitle className="text-xl text-blue-600">No Active Consultations</CardTitle>
                <CardDescription>
                  You don't have any patient consultations yet. Patients will reach out when they need your assistance.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex justify-center my-6">
                  <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center">
                    <MessageSquare className="h-8 w-8 text-blue-500" />
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-4">
              {chats.map((chat) => (
                <Card key={chat.chat_id} className="border-0 shadow-md hover:shadow-lg transition-all duration-300 bg-white overflow-hidden">
                  <Link
                    to={`/doctor/chat/${chat.chat_id}`}
                    className="block"
                  >
                    <div className="h-1 bg-gradient-to-r from-blue-400 to-blue-600"></div>
                    <div className="p-4">
                      <div className="flex items-center">
                        <div className="h-14 w-14 rounded-full overflow-hidden bg-blue-100 mr-4 shadow-inner">
                          <img
                            src={chat.patient.profile_photo_path || 'https://cdn-icons-png.flaticon.com/512/147/147142.png'}
                            alt={chat.patient.name}
                            className="h-full w-full object-cover"
                          />
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h3 className="font-medium text-blue-600">{chat.patient.name}</h3>
                            <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-200">Patient</Badge>
                          </div>
                          <p className="text-sm text-gray-600 mt-1 truncate">
                            {chat.chatMessages.length > 0
                              ? chat.chatMessages[0].content
                              : 'No messages yet'}
                          </p>
                        </div>
                      </div>
                      
                      <div className="grid grid-cols-3 gap-2 mt-4 text-xs text-gray-500">
                        <div className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {format(new Date(chat.updated_at), 'h:mm a')}
                        </div>
                        <div className="flex items-center gap-1">
                          <Calendar className="h-3 w-3" />
                          {format(new Date(chat.updated_at), 'MMM d, yyyy')}
                        </div>
                        <div className="flex items-center gap-1 justify-end">
                          <FileText className="h-3 w-3" />
                          {chat.chatMessages.length} messages
                        </div>
                      </div>
                    </div>
                  </Link>
                </Card>
              ))}
            </div>
          )}
          
          {/* Summary Section */}
          <div className={`mt-10 transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
            <div className="flex items-center mb-6">
              <h2 className="text-2xl font-semibold text-gray-900">Consultation Summary</h2>
              <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600">Active Consultations</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <MessageSquare className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">{chats.length}</span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600">Total Messages</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <FileText className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="text-3xl font-bold text-gray-800">
                      {chats.reduce((total, chat) => total + chat.chatMessages.length, 0)}
                    </span>
                  </div>
                </CardContent>
              </Card>
              
              <Card className="border-0 shadow-md bg-white">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-blue-600">Last Activity</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center">
                    <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-4">
                      <Clock className="h-6 w-6 text-blue-500" />
                    </div>
                    <span className="text-lg font-medium text-gray-800">
                      {chats.length > 0
                        ? format(new Date(
                            chats.reduce((latest, chat) => 
                              new Date(chat.updated_at) > new Date(latest) ? chat.updated_at : latest,
                              chats[0].updated_at
                            )
                          ), 'MMM d, h:mm a')
                        : 'No activity'}
                    </span>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
    </AppLayout>
  );
};

export default DoctorChatList;