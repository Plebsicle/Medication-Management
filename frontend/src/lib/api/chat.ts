import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000';

// Create axios instance with auth header
const api = axios.create({
  baseURL: API_URL,
});

// Add auth token to all requests
api.interceptors.request.use(
  (config) => {
    const jwt = localStorage.getItem('jwt');
    if (jwt) {
      config.headers.Authorization = `Bearer ${jwt}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Doctor-patient chat API
export const chatApi = {
  // Initiate a chat between patient and doctor
  initiateChat: async (doctorId: number) => {
    const response = await api.post('/chats/initiate', { doctorId });
    return response.data;
  },

  // Get messages for a specific chat
  getChatMessages: async (chatId: number) => {
    const response = await api.get(`/chats/messages/${chatId}`);
    return response.data.messages;
  },

  // Get all chats for the current user
  getUserChats: async () => {
    const response = await api.get('/chats/user-chats');
    console.log(response.data.chats);
    return response.data.chats;
  },

  // Get all available doctors (for patients)
  getAvailableDoctors: async () => {
    const response = await api.get('/chats/available-doctors');
    return response.data.doctors;
  },
  
  // Get chat information (including doctor and patient IDs)
  getChatInfo: async (chatId: number) => {
    const response = await api.get(`/chats/${chatId}`);
    return response.data.chat;
  },
}; 