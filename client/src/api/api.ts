import axios, { AxiosError, InternalAxiosRequestConfig } from 'axios';

// Get the API base URL from environment variables or use the current origin in production
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL ||
  (window.location.origin.includes('localhost') ? '' : window.location.origin);

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
  validateStatus: (status) => {
    return status >= 200 && status < 300;
  },
});

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
        const response = await axios.post<RefreshResponse>('/api/auth/refresh', {
          refreshToken: refreshToken as string  // Type assertion here
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

    return Promise.reject(error); // Pass other errors through
  }
);

export default api;