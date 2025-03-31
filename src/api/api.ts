import axios, { AxiosError, AxiosInstance, InternalAxiosRequestConfig } from 'axios';

// Define interface that extends AxiosInstance with our custom methods
interface ApiInstance extends AxiosInstance {
  ping: () => Promise<boolean>;
}

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
}) as ApiInstance;

let accessToken: string | null = null;

// Axios request interceptor: Attach access token to headers
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig): InternalAxiosRequestConfig => {
    if (!accessToken) {
      accessToken = localStorage.getItem('accessToken');
    }
    if (accessToken && config.headers) {
      config.headers.Authorization = `Bearer ${accessToken}`;
    }
    return config;
  },
  (error: AxiosError): Promise<AxiosError> => Promise.reject(error)
);

// Axios response interceptor: Handle 401 errors
api.interceptors.response.use(
  (response) => response, // If the response is successful, return it
  async (error: AxiosError): Promise<any> => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    // If the error is due to an expired access token
    if (error.response?.status && [401, 403].includes(error.response.status) && !originalRequest._retry) {
      originalRequest._retry = true; // Mark the request as retried

      try {
        // Get the refresh token
        const tokenFromStorage = localStorage.getItem('refreshToken');

        // If no refresh token, abandon refresh attempt
        if (!tokenFromStorage) {
          localStorage.removeItem('accessToken');
          accessToken = null;
          window.location.href = '/login';
          return Promise.reject(new Error('No refresh token available'));
        }

        // At this point we're sure the token exists
        // Use a manual type assertion with a temporary variable
        const refreshToken: string = tokenFromStorage;

        // Make the API call with the assured string token
        const response = await axios.post('/api/auth/refresh', { refreshToken });
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