import axios from 'axios';
import { useAuthStore } from '../store/authStore'; // We will create this

const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL + '/api', // Append /api
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request Interceptor to add JWT token
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token; // Get token from Zustand store
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Optional: Response Interceptor for error handling (e.g., logout on 401)
api.interceptors.response.use(
  (response) => response, // Pass through successful responses
  (error) => {
    if (error.response && error.response.status === 401) {
      console.warn('Unauthorized request (401). Logging out.');
      // Trigger logout action from Zustand store
      useAuthStore.getState().logout();
      // Optionally redirect to login page
      // window.location.href = '/login'; // Might cause full refresh, use router navigation instead
    }
    // Important: Reject the promise so calling code handles the error
    return Promise.reject(error);
  }
);

export default api;