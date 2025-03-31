import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get the API base URL from environment variables or use dynamic detection
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (window.location.hostname.includes('vercel.app')
    ? 'https://sparkgen-api.onrender.com'
    : window.location.origin.includes('localhost')
      ? ''
      : window.location.origin);

console.log('Using API base URL:', API_BASE_URL);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  withCredentials: true, // Important for CORS with credentials
  timeout: 30000, // Increased from 10000 to 30000 (30 seconds)
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

    // Add request logging for debugging
    console.log(`API Request: ${config.method?.toUpperCase()} ${config.url}`,
      config.params ? `Params: ${JSON.stringify(config.params)}` : '',
      config.data ? `Data: ${JSON.stringify(config.data)}` : '');

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
    console.error('API Request Error:', error);
    return Promise.reject(error);
  }
);

// Axios response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => {
    console.log(`API Response: ${response.status} ${response.config.method?.toUpperCase()} ${response.config.url}`);
    return response;
  },
  async (error: AxiosError) => {
    // Handle network errors
    if (error.message === 'Network Error') {
      console.error('Network error - unable to connect to API');
      return Promise.reject(new Error('Unable to connect to server. Please check your internet connection.'));
    }

    console.error('API Response Error:', error);
    if (error.response) {
      console.error(`Status: ${error.response.status}`, error.response.data);
    } else if (error.request) {
      console.error('No response received:', error.request);
    }

    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

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

export default api;