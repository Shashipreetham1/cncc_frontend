import api from '../../lib/api'; // Import the configured Axios instance
// Import Role from shared types if needed elsewhere, or from store if User includes it
import { Role } from '../../types/shared';
// Use User type from store as it contains id, username, role used in login response
import { User } from '../../store/authStore';

// Define the expected response structure from the /users/login endpoint
interface LoginResponse {
    id: string;
    username: string;
    role: Role; // Role enum/type
    token: string;
}

// Define the structure of the data sent TO the login endpoint
interface LoginCredentials {
    username: string;
    password?: string; // Optional here, but required by API call
}

/**
 * Calls the backend login API endpoint.
 * @param credentials - Object containing username and REQUIRED password.
 * @returns Promise resolving to the LoginResponse data including the JWT token.
 */
export const loginUserApi = async (credentials: Required<LoginCredentials>): Promise<LoginResponse> => {
    if (!credentials.password) {
        // Add basic validation before sending API request
        throw new Error("Password is required for login.");
    }
    try {
        const response = await api.post<LoginResponse>('/users/login', credentials);
        return response.data;
    } catch (error: any) {
        console.error("API Login Error:", error);
        // Axios interceptor will likely handle 401 by logging out.
        // Let calling code handle specific error messages for 400/500 etc.
        throw error;
    }
};


/**
 * Defines the structure returned by the /users/profile endpoint.
 * Extends the basic User type with timestamps or other details.
 */
export interface UserProfile extends User {
    createdAt: string; // Expect ISO date strings from backend
    updatedAt: string;
    // Add any other fields returned by your specific /users/profile backend implementation
}

/**
 * Fetches the detailed profile of the currently authenticated user.
 * Uses the token already attached by the Axios request interceptor.
 * @returns Promise resolving to the UserProfile data.
 */
export const fetchUserProfileApi = async (): Promise<UserProfile> => {
    try {
        // GET request to the profile endpoint
        const response = await api.get<UserProfile>('/users/profile');
        return response.data; // Return the detailed user profile object
    } catch (error: any) {
        console.error("API Get User Profile Error:", error);
        // Axios interceptor handles 401. Re-throw for component to display error.
        throw error;
    }
};

// Potential future API calls related to auth:
// export const registerUserApi = async (data) => { ... }
// export const changePasswordApi = async (data) => { ... }
// export const forgotPasswordApi = async (data) => { ... }
// export const resetPasswordApi = async (data) => { ... }