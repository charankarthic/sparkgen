import api from './api';

/**
 * Login user with email and password
 * @param email User email
 * @param password User password
 * @returns User data
 */
export const loginUser = async (email: string, password: string) => {
  try {
    // Try to ping the server first to verify connectivity
    const isServerReachable = await api.ping();
    
    if (!isServerReachable) {
      console.error("Server connectivity issue detected before login attempt");
      throw new Error("Server appears to be unreachable. Please check your internet connection and try again.");
    }
    
    const response = await api.post('/api/auth/login', { email, password });
    return response.data;
  } catch (error: any) {
    console.error('Login error:', error);
    if (error.response) {
      // The request was made and the server responded with a status code
      // that falls out of the range of 2xx
      throw new Error(error.response.data.error || 'Login failed. Please check your credentials.');
    } else if (error.request) {
      // The request was made but no response was received
      throw new Error('No response from server. Please check your internet connection and try again.');
    } else {
      // Something happened in setting up the request that triggered an Error
      throw new Error(error.message || 'An error occurred during login. Please try again.');
    }
  }
};

/**
 * Register a new user
 * @param name User's name
 * @param email User's email
 * @param password User's password
 * @returns Registered user data
 */
export const registerUser = async (name: string, email: string, password: string) => {
  try {
    // Try to ping the server first to verify connectivity
    const isServerReachable = await api.ping();
    
    if (!isServerReachable) {
      console.error("Server connectivity issue detected before registration attempt");
      throw new Error("Server appears to be unreachable. Please check your internet connection and try again.");
    }
    
    const response = await api.post('/api/auth/register', { name, email, password });
    return response.data;
  } catch (error: any) {
    console.error('Registration error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Registration failed. Please try again.');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'An error occurred during registration. Please try again.');
    }
  }
};

/**
 * Get current user data
 * @returns Current user data or null if not logged in
 */
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/api/auth/me');
    return response.data;
  } catch (error: any) {
    console.error('Error fetching current user:', error);
    if (error.response && error.response.status === 401) {
      // User is not authenticated, this is not an error to display to the user
      return null;
    }
    // For other errors, we'll just return null and log the error
    return null;
  }
};

/**
 * Logout the current user
 */
export const logoutUser = async () => {
  try {
    const response = await api.post('/api/auth/logout');
    return response.data;
  } catch (error) {
    console.error('Logout error:', error);
    throw new Error('Failed to logout. Please try again.');
  }
};

/**
 * Send password reset email
 * @param email User's email
 */
export const forgotPassword = async (email: string) => {
  try {
    const response = await api.post('/api/auth/forgot-password', { email });
    return response.data;
  } catch (error: any) {
    console.error('Forgot password error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to send password reset email. Please try again.');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'An error occurred. Please try again.');
    }
  }
};

/**
 * Reset password with token
 * @param token Reset token
 * @param password New password
 */
export const resetPassword = async (token: string, password: string) => {
  try {
    const response = await api.post('/api/auth/reset-password', { token, password });
    return response.data;
  } catch (error: any) {
    console.error('Reset password error:', error);
    if (error.response) {
      throw new Error(error.response.data.error || 'Failed to reset password. Please try again.');
    } else if (error.request) {
      throw new Error('No response from server. Please check your internet connection and try again.');
    } else {
      throw new Error(error.message || 'An error occurred. Please try again.');
    }
  }
};