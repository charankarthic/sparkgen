import api from './api';
import { AxiosError } from 'axios';

interface Achievement {
  title: string;
  description: string;
}

interface Stats {
  quizzesCompleted: number;
  correctAnswers: number;
  totalAnswers: number;
}

// Description: Get user profile
// Endpoint: GET /api/user/profile
// Request: {}
// Response: { _id: string, displayName: string, xp: number, level: number, achievements: Achievement[], stats: Stats }
export const getUserProfile = async () => {
  try {
    const response = await api.get('/api/user/profile');
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to fetch user profile');
    }
  }
};

// Description: Get leaderboard
// Endpoint: GET /api/user/leaderboard
// Request: {}
// Response: Array<{ id: string, username: string, xp: number, level: number, rank: number }>
export const getLeaderboard = async () => {
  try {
    const response = await api.get('/api/user/leaderboard');
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to fetch leaderboard');
    }
  }
};

// Description: Update user XP
// Endpoint: PUT /api/user/:userId/xp
// Request: { xp: number }
// Response: { xp: number, level: number, level_up: boolean, xp_for_next_level: number }
export const updateUserXP = async (userId: string, xp: number) => {
  try {
    const response = await api.put(`/api/user/${userId}/xp`, { xp });
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to update user XP');
    }
  }
};

// Description: Add an achievement to a user
// Endpoint: POST /api/user/:userId/achievements
// Request: { title: string, description: string }
// Response: { message: string, achievement: Achievement, achievements: Achievement[] }
export const addUserAchievement = async (userId: string, achievement: { title: string, description: string }) => {
  try {
    const response = await api.post(`/api/user/${userId}/achievements`, achievement);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to add achievement');
    }
  }
};

// Description: Update user's display name
// Endpoint: PUT /api/user/:userId/displayName
// Request: { displayName: string }
// Response: { displayName: string }
export const updateUserDisplayName = async (userId: string, displayName: string) => {
  try {
    const response = await api.put(`/api/user/${userId}/displayName`, { displayName });
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to update display name');
    }
  }
};

// Description: Delete user account
// Endpoint: DELETE /api/user/:userId
// Request: {}
// Response: { success: boolean, message: string }
export const deleteUserAccount = async (userId: string) => {
  try {
    const response = await api.delete(`/api/user/${userId}`);
    return response.data;
  } catch (error) {
    console.error(error);
    if (error instanceof AxiosError && error.response?.data?.error) {
      throw new Error(error.response.data.error);
    } else if (error instanceof Error) {
      throw new Error(error.message);
    } else {
      throw new Error('Failed to delete account');
    }
  }
};