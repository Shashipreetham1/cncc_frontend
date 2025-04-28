// src/lib/api.ts
import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore';
import { toast } from 'react-toastify'; // Import toast

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';
if (!API_BASE_URL) console.error("FATAL: VITE_API_BASE_URL not set");

const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Using backend directly, no Vite proxy assumed now
  headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
  timeout: 15000,
});

// Request interceptor (adds token)
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor (handles 401)
api.interceptors.response.use(
  (response) => response, // Pass through success
  (error) => {
    const { response, config } = error;
    if (response && response.status === 401) {
      console.warn('👮‍♂️ Axios 401 Interceptor. Logging out...');
      const { logout, token } = useAuthStore.getState();
      const isLoginRequest = config.url === '/users/login';
      // Only logout if token existed *before* this failed request
      // AND it wasn't the login request itself that failed with 401
      if (token && !isLoginRequest) {
        logout();
        // Redirect after brief delay for toast
        setTimeout(() => { window.location.href = '/login'; }, 1500);
        toast.error("Session expired or invalid. Please log in.", { toastId: 'session-expired' });
        return Promise.reject(new Error("Session expired")); // Stop further processing
      }
    }
    // For other errors, reject so component .catch() can handle
    return Promise.reject(error);
  }
);

export default api;