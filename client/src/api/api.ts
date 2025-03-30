import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get the API base URL from environment variables or use dynamic detection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname.includes('vercel.app')
    ? 'https://sparkgen-api.onrender.com'
    : window.location.origin.includes('localhost')
      ? 'http://localhost:3000'
      : window.location.origin);

console.log('Using API base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 10000, // 10 second timeout
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

let accessToken: string | null = null;

// Axios request interceptor: Attach access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Log outgoing requests in development
    if (import.meta.env.DEV) {
      console.log(`🌐 API Request: ${config.method?.toUpperCase()} ${config.url}`);
    }

    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }

    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }

    return config;
  },
  (error: AxiosError) => {
    console.error('Request error:', error.message);
    return Promise.reject(error);
  }
);

// Axios response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response, // If the response is successful, return it
  async (error: AxiosError) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // Add better error logging
    console.log(`API Error: ${error.message}`);
    console.log(`Request URL: ${originalRequest?.url}`);

    // Handle network errors
    if (error.message === 'Network Error' || error.code === 'ERR_NETWORK' || error.code === 'ECONNABORTED') {
      console.log('Backend connection issue detected. Checking server availability...');
      
      try {
        // Try to reach the server with a simple ping request
        await axios.get(`${API_BASE_URL}/ping`, {
          timeout: 3000,
          withCredentials: false
        });
        console.log('Server is reachable, but the specific endpoint may have issues');
      } catch (pingError) {
        console.log('Server is not reachable. Backend might be down or incorrectly configured');
        // Return a more specific error for the UI
        return Promise.reject({
          ...error,
          message: 'Cannot connect to the server. Please check if the backend is running and accessible.'
        });
      }
      
      console.error('Network error - unable to connect to API');
      return Promise.reject(new Error('Unable to connect to server. Please check your internet connection.'));
    }

    // If the error is due to an expired access token
    if (error.response?.status && [401, 403].includes(error.response.status) && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      // Get the refresh token
      const refreshToken = localStorage.getItem('refreshToken');

      // If no refresh token, we can't refresh the session
      if (!refreshToken) {
        localStorage.removeItem('accessToken');
        accessToken = null;
        window.location.href = '/login';
        return Promise.reject(new Error('No refresh token available'));
      }

      try {
        // Use a type-safe approach that avoids passing null
        interface RefreshResponse {
          data?: {
            accessToken?: string;
            refreshToken?: string;
          }
        }

        // Call the refresh endpoint with the token that we've verified is not null
        const response = await axios.post<RefreshResponse>(`${API_BASE_URL}/api/auth/refresh`, {
          refreshToken: refreshToken
        }, {
          headers: {
            'Content-Type': 'application/json'
          }
        });

        const data = response.data;

        if (data?.data?.accessToken) {
          accessToken = data.data.accessToken;
          localStorage.setItem('accessToken', accessToken);

          if (data.data.refreshToken) {
            localStorage.setItem('refreshToken', data.data.refreshToken);
          }

          // Retry the original request with the new token
          if (originalRequest.headers) {
            originalRequest.headers.Authorization = `Bearer ${accessToken}`;
          }
          return api(originalRequest);
        } else {
          throw new Error('Invalid token response');
        }
      } catch (err) {
        console.log('Token refresh failed:', err);
        // If refresh fails, clear tokens and redirect to login
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('accessToken');
        accessToken = null;
        window.location.href = '/login'; // Redirect to login page
        return Promise.reject(err);
      }
    }

    // Log errors in development
    if (import.meta.env.DEV) {
      console.error('API Response Error:', {
        status: error.response?.status,
        data: error.response?.data,
        message: error.message
      });
    }

    return Promise.reject(error); // Pass other errors through
  }
);

// Add a simple ping function to test connectivity
api.ping = async () => {
  try {
    await axios.get(`${API_BASE_URL}/api/logs/ping`, { timeout: 3000 });
    return true;
  } catch (error) {
    console.error('Server ping failed:', error);
    return false;
  }
};

export default api;