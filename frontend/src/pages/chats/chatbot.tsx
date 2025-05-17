import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import AiLimitBadge from '@/components/AI/limitComponent';
import { AppLayout } from '@/components/layout/AppLayout';
import { useChatSocket } from '../../hooks/useChatSocketHooks';


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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (input.trim() === '') return;
    sendMessage(input);
    setInput('');
  };

  return (
    <AppLayout>
      <div className="container mx-auto max-w-4xl">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-2xl font-bold">Medical Assistant</h1>
          <AiLimitBadge />
        </div>

        <div className="mb-4 p-4 bg-yellow-50 border-l-4 border-yellow-500 text-yellow-700">
          <p className="font-bold">Important Note:</p>
          <p>This AI assistant provides general information only and is not a substitute for professional medical advice.</p>
          <p>Always consult a healthcare professional for proper medical diagnosis and treatment.</p>
        </div>

        {connectionError && (
          <div className="mb-4 p-4 bg-red-50 border-l-4 border-red-500 text-red-700">
            <p className="font-bold">Connection Error:</p>
            <p>{connectionError}</p>
          </div>
        )}

        <Card className="p-4 mb-4">
          <div className="h-96 overflow-y-auto mb-4">
            {messages.length === 0 ? (
              <div className="text-center text-gray-500 mt-20">
                <p>No messages yet. Ask a medical question to get started.</p>
                <p className="text-sm mt-2">Example: "What could be causing my headache and fever?"</p>
              </div>
            ) : (
              messages.map((message : Message, index : number) => (
                <div
                  key={message.id || index}
                  className={`mb-4 ${message.is_ai ? 'text-left' : 'text-right'}`}
                >
                  <div
                    className={`inline-block p-3 rounded-lg max-w-[80%] ${
                      message.is_ai
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-green-100 text-green-800'
                    }`}
                  >
                    {message.content}
                  </div>
                </div>
              ))
            )}

            {isLoading && (
              <div className="text-left mb-4">
                <div className="inline-block p-3 rounded-lg bg-blue-100 text-blue-800">
                  <div className="flex space-x-2 items-center">
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-150"></div>
                    <div className="w-2 h-2 rounded-full bg-blue-500 animate-pulse delay-300"></div>
                    <span className="text-sm ml-1">AI is thinking...</span>
                  </div>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <form onSubmit={handleSendMessage} className="flex gap-2">
            <Input
              type="text"
              placeholder={
                limitReached
                  ? "AI prompt limit reached"
                  : isConnected
                    ? "Type your medical question here..."
                    : "Connecting to server..."
              }
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={!isConnected || isLoading || limitReached}
              className="flex-1"
            />
            <Button
              type="submit"
              disabled={!isConnected || input.trim() === '' || isLoading || limitReached}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </Button>
          </form>
        </Card>
      </div>
    </AppLayout>
  );
}
