// src/features/admin/adminApi.ts
import api from '../../lib/api';
import {  PaginatedResponse, ApiErrorResponse } from '../../types'; // Import shared types
interface User {
    id: string;
    username: string;
    email: string;
    role: 'USER' | 'ADMIN';
    createdAt: string;
    updatedAt: string;
}
/**
 * Fetches a paginated list of all users (Admin Only).
 * Note: Backend controller already enforces admin role via middleware.
 */
export const fetchAllUsers = async (
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<PaginatedResponse<User>> => { // Assuming backend returns PaginatedResponse<User> structure
    try {
        const response = await api.get<PaginatedResponse<User>>('/users', {
            params: { page, limit, sortBy, sortOrder }
        });
        return response.data;
    } catch (error) {
        console.error("API Error fetching all users:", error);
        throw error; // Re-throw for component handling
    }
};

/**
 * Promotes a specified user to the ADMIN role (Admin Only).
 * @param userId - The ID of the user to promote.
 * @returns Promise resolving to the success message and updated user info.
 */
export const promoteUserToAdmin = async (
    userId: string
): Promise<{ message: string, user: User }> => {
    if (!userId) throw new Error("User ID is required to promote.");
    try {
        // Backend route expects PUT /api/users/promote/:userId
        const response = await api.put<{ message: string, user: User }>(`/users/promote/${userId}`);
        return response.data;
    } catch (error) {
        console.error(`API Error promoting user ${userId}:`, error);
        throw error;
    }
};

/**
 * Registers a new user (Admin Only).
 * Takes username, password, and optional role.
 * Matches the signature of the backend controller.
 */
 export const registerUserApiAdmin = async (userData: {
    username: string;
    password?: string; // Make required if always needed for register route
    role?: 'USER' | 'ADMIN';
}): Promise<User> => { // Assuming backend returns the created User object (without password)
    if(!userData.password) throw new Error("Password is required for registration."); // Client-side check
    try {
        const response = await api.post<User>('/users/register', userData);
        return response.data;
    } catch (error: any) {
         console.error("API Error registering user:", error);
         throw error;
    }
};