import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import AiLimitBadge from '@/components/AI/limitComponent';
import { AppLayout } from '@/components/layout/AppLayout';
import { useChatSocket } from '../../hooks/useChatSocketHooks';
import { Link } from 'react-router-dom';
import { ArrowLeft, MessageSquare, Bot, Send, AlertTriangle } from 'lucide-react';

export interface Message {
  id?: number;
  content: string;
  is_ai: boolean;
  created_at?: string;
}

export default function Chatbot() {
  const {
    messages,
    sendMessage,
    isConnected,
    isLoading,
    limitReached,
    connectionError
  } = useChatSocket();

  const [input, setInput] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    setIsVisible(true);
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    sendMessage(input);
    setInput('');
  };

  const exampleQuestions = [
    "What could be causing my headache and fever?",
    "Is it normal to feel dizzy after taking this medication?",
    "What are common side effects of blood pressure medications?",
    "How can I manage my diabetes better?"
  ];

  return (
    <AppLayout>
      <main className="min-h-screen bg-gradient-to-b from-blue-50 to-white pb-12">
        {/* Hero Section - Mobile Optimized */}
        <section className={`relative pt-4 sm:pt-8 pb-6 sm:pb-10 px-4 md:px-6 lg:px-8 transition-opacity duration-700 ${isVisible ? 'opacity-100' : 'opacity-0'}`}>
          <div className="max-w-6xl mx-auto">
            <div className="flex flex-col lg:flex-row items-center gap-6 lg:gap-8">
              <div className="w-full lg:w-1/2 space-y-3 sm:space-y-4 text-center lg:text-left">
                <div className="inline-block bg-blue-100 text-blue-700 rounded-full px-3 sm:px-4 py-1 text-xs sm:text-sm font-medium mb-2">
                  AI Health Assistant
                </div>
                <h1 className="text-2xl sm:text-3xl md:text-4xl font-bold text-gray-900 leading-tight">
                  Your Medical <span className="text-blue-600">AI</span> Assistant
                </h1>
                <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0">
                  Get answers to your medical questions and health concerns from our AI assistant.
                </p>
                <div className="pt-2">
                  <Button asChild variant="outline" className="border-blue-300 text-blue-600 hover:bg-blue-50 rounded-xl text-sm sm:text-base">
                    <Link to="/dashboard" className="flex items-center gap-2">
                      <ArrowLeft className="h-3 w-3 sm:h-4 sm:w-4" />
                      <span className="hidden sm:inline">Back to Dashboard</span>
                      <span className="sm:hidden">Back</span>
                    </Link>
                  </Button>
                </div>
              </div>
              <div className="w-full lg:w-1/2 mt-4 lg:mt-0 flex justify-center">
                <div className="relative w-48 h-48 sm:w-64 sm:h-64 md:w-full md:max-w-md md:aspect-square bg-blue-100/50 rounded-full flex items-center justify-center shadow-xl">
                  <div className="absolute inset-0 rounded-full bg-gradient-to-tr from-blue-100 to-indigo-50 opacity-50" />
                  <div className="relative h-20 w-20 sm:h-24 sm:w-24 md:h-32 md:w-32 bg-blue-500 rounded-full flex items-center justify-center">
                    <Bot className="h-10 w-10 sm:h-12 sm:w-12 md:h-16 md:w-16 text-white" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        <div className={`container mx-auto px-4 max-w-4xl transition-all duration-1000 delay-300 ${isVisible ? 'translate-y-0 opacity-100' : 'translate-y-10 opacity-0'}`}>
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-4 sm:mb-6 gap-3">
            <div className="flex items-center flex-grow">
              <h2 className="text-xl sm:text-2xl font-semibold text-gray-900">Medical Assistant</h2>
              <div className="ml-4 h-1 bg-blue-100 flex-grow rounded-full"></div>
            </div>
            <div className="flex justify-center sm:justify-end">
              <AiLimitBadge />
            </div>
          </div>

          {/* Warning Card */}
          <div className="mb-4 sm:mb-6">
            <Card className="border-0 shadow-md bg-yellow-50 border-l-4 border-yellow-500">
              <CardContent className="p-3 sm:p-4">
                <div className="flex items-start gap-2 sm:gap-3">
                  <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-yellow-600 mt-1 flex-shrink-0" />
                  <div className="min-w-0">
                    <p className="font-bold text-yellow-700 text-sm sm:text-base">Important Note:</p>
                    <p className="text-yellow-700 text-xs sm:text-sm leading-relaxed">
                      This AI assistant provides general information only and is not a substitute for professional medical advice.
                    </p>
                    <p className="text-yellow-700 text-xs sm:text-sm leading-relaxed">
                      Always consult a healthcare professional for proper medical diagnosis and treatment.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Connection Error */}
          {connectionError && (
            <div className="mb-4 sm:mb-6">
              <Card className="border-0 shadow-md bg-red-50 border-l-4 border-red-500">
                <CardContent className="p-3 sm:p-4">
                  <div className="flex items-start gap-2 sm:gap-3">
                    <AlertTriangle className="h-4 w-4 sm:h-5 sm:w-5 text-red-600 mt-1 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="font-bold text-red-700 text-sm sm:text-base">Connection Error:</p>
                      <p className="text-red-700 text-xs sm:text-sm break-words">{connectionError}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Chat Card */}
          <Card className="border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-white overflow-hidden mb-8">
            <div className="h-2 bg-gradient-to-r from-blue-400 to-blue-600"></div>
            <CardHeader className="pb-2 px-4 sm:px-6">
              <CardTitle className="text-lg sm:text-xl text-blue-600">Chat with AI</CardTitle>
              <CardDescription className="text-sm sm:text-base">Ask medical questions and get instant information</CardDescription>
            </CardHeader>
            <CardContent className="px-4 sm:px-6">
              {/* Messages Container - Mobile Optimized */}
              <div className="h-80 sm:h-96 overflow-y-auto mb-4 p-2 border rounded-lg bg-gray-50/50">
                {messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center h-full space-y-4 sm:space-y-6 px-2">
                    <div className="w-16 h-16 sm:w-20 sm:h-20 bg-blue-100 rounded-full flex items-center justify-center">
                      <MessageSquare className="h-6 w-6 sm:h-8 sm:w-8 text-blue-500" />
                    </div>
                    <div className="text-center space-y-2">
                      <p className="text-gray-500 text-sm sm:text-base">No messages yet. Ask a medical question to get started.</p>
                      <div className="text-sm text-gray-400 space-y-2 mt-4">
                        <p className="font-medium text-blue-600 text-xs sm:text-sm">Try asking:</p>
                        <div className="grid grid-cols-1 gap-2 mt-2 max-w-sm mx-auto">
                          {exampleQuestions.map((question, index) => (
                            <Button 
                              key={index} 
                              variant="outline"
                              className="text-left text-xs border-blue-200 text-blue-600 h-auto py-2 px-3 whitespace-normal leading-tight"
                              onClick={() => {
                                setInput(question);
                                setTimeout(() => {
                                  const inputEl = document.querySelector('input[type="text"]') as HTMLInputElement;
                                  if (inputEl) inputEl.focus();
                                }, 100);
                              }}
                            >
                              {question}
                            </Button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  messages.map((message : Message, index : number) => (
                    <div
                      key={message.id || index}
                      className={`mb-3 sm:mb-4 ${message.is_ai ? 'text-left' : 'text-right'}`}
                    >
                      <div
                        className={`inline-block p-2 sm:p-3 rounded-lg max-w-[85%] sm:max-w-[80%] text-sm sm:text-base leading-relaxed ${
                          message.is_ai
                            ? 'bg-blue-100 text-blue-800'
                            : 'bg-green-100 text-green-800'
                        }`}
                      >
                        <div className="break-words whitespace-pre-wrap">
                          {message.content}
                        </div>
                      </div>
                    </div>
                  ))
                )}

                {isLoading && (
                  <div className="text-left mb-3 sm:mb-4">
                    <div className="inline-block p-2 sm:p-3 rounded-lg bg-blue-100 text-blue-800">
                      <div className="flex space-x-2 items-center">
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                        <div className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                        <span className="text-xs sm:text-sm ml-1">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </CardContent>
            <CardFooter className="bg-gray-50 pt-3 sm:pt-4 px-4 sm:px-6">
              <form onSubmit={handleSendMessage} className="flex gap-2 w-full">
                <Input
                  type="text"
                  placeholder={
                    limitReached
                      ? "AI prompt limit reached"
                      : isConnected
                        ? "Type your medical question..."
                        : "Connecting..."
                  }
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  disabled={!isConnected || isLoading || limitReached}
                  className="flex-1 text-sm sm:text-base min-w-0"
                />
                <Button
                  type="submit"
                  disabled={!isConnected || input.trim() === '' || isLoading || limitReached}
                  className="bg-blue-600 hover:bg-blue-700 rounded-xl px-3 sm:px-4 flex-shrink-0"
                >
                  {isLoading ? (
                    <span className="text-xs sm:text-sm">Sending...</span>
                  ) : (
                    <Send className="h-3 w-3 sm:h-4 sm:w-4" />
                  )}
                </Button>
              </form>
            </CardFooter>
          </Card>
        </div>
      </main>
    </AppLayout>
  );
}