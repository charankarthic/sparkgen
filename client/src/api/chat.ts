import api from './api';
import { AxiosError } from 'axios';

// Description: Send message to AI assistant
// Endpoint: POST /api/chat
// Request: { message: string }
// Response: { response: string }
export const sendMessage = async (message: string) => {
  try {
    const response = await api.post('/api/chat', { message });
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to send message');
    }
  }
};