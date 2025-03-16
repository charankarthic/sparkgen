import api from './api';

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
    throw new Error(error?.response?.data?.error || error.message);
  }
};