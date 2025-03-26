import api from './api';
import { AxiosError } from 'axios';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string }
export const login = async (email: string, password: string) => {
  try {
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error) {
    console.error('Login error:', error);
    if (error instanceof AxiosError && error.response?.data?.message) {
      throw new Error(error.response.data.message);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Login failed');
    }
  }
};

// Description: Register user functionality
// Endpoint: POST /api/auth/register
// Request: { email: string, password: string }
// Response: { email: string }
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
// Response: { success: boolean, message: string }
export const logout = async () => {
  try {
    return await api.post('/api/auth/logout');
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