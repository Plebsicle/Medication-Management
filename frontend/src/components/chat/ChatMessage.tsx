import React from 'react';
import { format } from 'date-fns';

interface User {
  id: number;
  name: string;
  profile_photo_path: string | null;
  role: string;
}

interface MessageProps {
  id: number;
  content: string;
  created_at: string;
  user: User;
  isCurrentUser: boolean;
}

const ChatMessage: React.FC<MessageProps> = ({ content, created_at, user, isCurrentUser }) => {
  const messageTime = format(new Date(created_at), 'h:mm a');
  const defaultAvatar = 'https://cdn-icons-png.flaticon.com/512/147/147142.png';
  
  return (
    <div className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'} mb-4`}>
      {!isCurrentUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden mr-3">
          <img 
            src={user.profile_photo_path || defaultAvatar} 
            alt={user.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
      
      <div className={`max-w-[75%] ${isCurrentUser ? 'bg-blue-500 text-white' : 'bg-gray-100'} rounded-lg p-3`}>
        {!isCurrentUser && (
          <div className="font-semibold text-xs mb-1">{user.name}</div>
        )}
        
        <div className="text-sm">{content}</div>
        
        <div className={`text-xs mt-1 ${isCurrentUser ? 'text-blue-100' : 'text-gray-500'} text-right`}>
          {messageTime}
        </div>
      </div>
      
      {isCurrentUser && (
        <div className="flex-shrink-0 h-10 w-10 rounded-full overflow-hidden ml-3">
          <img 
            src={user.profile_photo_path || defaultAvatar} 
            alt={user.name}
            className="h-full w-full object-cover"
          />
        </div>
      )}
    </div>
  );
};

export default ChatMessage; 