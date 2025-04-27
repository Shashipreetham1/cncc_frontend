import axios, { InternalAxiosRequestConfig, AxiosResponse } from 'axios';
import { useAuthStore } from '../store/authStore'; // Ensure this path is correct

// Get base API URL from environment variables
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3001';

// Create Axios instance
const api = axios.create({
  baseURL: `${API_BASE_URL}/api`, // Append '/api' to the base URL
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
  // Optional: Set timeout
  // timeout: 10000, // 10 seconds
});

// --- Axios Request Interceptor ---
// Automatically adds the JWT token to the Authorization header for outgoing requests
api.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    // Get token from Zustand store *state* directly
    const token = useAuthStore.getState().token;
    if (token && config.headers) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    // Handle request errors (e.g., network issues before request is sent)
    console.error('Axios Request Error:', error);
    return Promise.reject(error);
  }
);

// --- Axios Response Interceptor ---
// Handles responses globally, particularly useful for auth errors (e.g., 401 Unauthorized)
api.interceptors.response.use(
  (response: AxiosResponse) => {
    // Any status code within the range of 2xx cause this function to trigger
    // Simply return the successful response
    return response;
  },
  (error) => {
    // Any status codes outside the range of 2xx cause this function to trigger
    const { response } = error;

    // Check if it's a 401 Unauthorized error (likely due to expired/invalid token)
    if (response && response.status === 401) {
      console.warn('👮‍♂️ Received 401 Unauthorized response. Logging out...');
      const { logout, token } = useAuthStore.getState();
      // Only logout if there was a token present before (avoid infinite loops on login page)
      if (token) {
         logout(); // Clear user state and token using Zustand action
         // Optionally redirect using router.navigate() within a component context,
         // or use a simple window redirect here if needed (causes full page refresh)
         // window.location.href = '/login';
         alert("Your session has expired or is invalid. Please log in again."); // Simple alert
      }
    }

    // Important: Reject the promise so the error can be handled
    // by the calling code (.catch() block) if needed locally
    return Promise.reject(error);
  }
);

export default api; // Export the configured instance