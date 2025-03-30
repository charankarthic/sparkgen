import api from './api';
import { AxiosError } from 'axios';
import { toast } from 'sonner';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string, user: { _id: string, email: string, displayName: string } }
export const login = async (email: string, password: string) => {
  try {
    // Check server connectivity first
    const isServerOnline = await api.ping();
    if (!isServerOnline) {
      toast.error('Cannot connect to the server. Please check your internet connection or try again later.');
      throw new Error('Server is not reachable. Please check your internet connection or try again later.');
    }

    // Proceed with login
    console.log('Attempting login for:', email);
    const response = await api.post('/api/auth/login', { email, password });
    console.log('Login successful');
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);

    // Provide more specific error messages
    if (error.code === 'ERR_NETWORK') {
      toast.error('Network error: Unable to connect to the server. Please check if the server is running.');
      throw new Error('Network error: Unable to connect to the server. Please check if the server is running.');
    }

    if (error.response) {
      // The server responded with a status code outside the 2xx range
      const message = error.response.data?.message || 'Login failed. Please check your credentials.';
      toast.error(message);
      throw new Error(message);
    }

    // For other errors
    const errorMessage = error.message || 'An unexpected error occurred during login';
    toast.error(errorMessage);
    throw new Error(errorMessage);
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { accessToken: string, user: { _id: string, email: string, displayName: string } }
export const register = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/register', {email, password});
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Registration failed');
    }
  }
};

// Description: Logout
// Endpoint: POST /api/auth/logout
// Request: {}
// Response: { message: string }
export const logout = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Logout failed');
    }
  }
};

// Description: Refresh token
// Endpoint: POST /api/auth/refresh
// Request: { refreshToken: string }
// Response: { success: boolean, data: { accessToken: string, refreshToken: string } }
export const refreshToken = async (refreshToken: string) => {
  try {
    const response = await api.post('/api/auth/refresh', { refreshToken });
    return response.data;
  } catch (error) {
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Token refresh failed');
    }
  }
};