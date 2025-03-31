import api from './api';
import { AxiosError } from 'axios';

// Description: Login user functionality
// Endpoint: POST /api/auth/login
// Request: { email: string, password: string }
// Response: { accessToken: string, refreshToken: string, user: { _id: string, email: string, displayName: string } }
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