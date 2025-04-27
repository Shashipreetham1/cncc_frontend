// src/features/stockRegister/stockRegisterApi.ts
import api from '../../lib/api';
import { StockRegister, PaginatedResponse, EditRequest } from '../../types';

/**
 * Fetches a paginated list of Stock Register entries.
 */
export const fetchStockEntries = async (
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<PaginatedResponse<StockRegister>> => {
    try {
        const response = await api.get<PaginatedResponse<StockRegister>>('/stock-register', {
            params: { page, limit, sortBy, sortOrder },
        });
        // Add fullFileUrl client-side for photos
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
        response.data.results = response.data.results.map(sr => ({
            ...sr,
            fullFileUrl: sr.photoUrl ? `${backendBase}/${sr.photoUrl}` : undefined
        }));
        return response.data;
    } catch (error) {
        console.error("API Error fetching stock entries:", error);
        throw error;
    }
};

/**
 * Fetches a single Stock Register entry by its ID.
 */
export const fetchStockEntryById = async (id: string): Promise<StockRegister> => {
     if (!id) throw new Error("Stock Register entry ID is required.");
    try {
        const response = await api.get<StockRegister>(`/stock-register/${id}`);
        // Add fullFileUrl client-side
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
        if(response.data.photoUrl) {
            response.data.fullFileUrl = `${backendBase}/${response.data.photoUrl}`;
        }
        return response.data;
    } catch (error) {
        console.error(`API Error fetching stock entry ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new Stock Register entry. Handles photo upload via FormData.
 */
export const createStockEntry = async (formData: FormData): Promise<StockRegister> => {
    try {
        const response = await api.post<StockRegister>('/stock-register', formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error("API Error creating stock entry:", error);
        throw error;
    }
};

/**
 * Updates an existing Stock Register entry. Handles photo upload via FormData.
 */
export const updateStockEntry = async (id: string, formData: FormData): Promise<StockRegister> => {
     if (!id) throw new Error("Stock Register entry ID is required for update.");
    try {
        const response = await api.put<StockRegister>(`/stock-register/${id}`, formData, {
            headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error(`API Error updating stock entry ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a Stock Register entry by its ID.
 */
export const deleteStockEntry = async (id: string): Promise<{ message: string }> => {
    if (!id) throw new Error("Stock Register entry ID is required for deletion.");
    try {
        const response = await api.delete<{ message: string }>(`/stock-register/${id}`);
        return response.data;
    } catch (error) {
        console.error(`API Error deleting stock entry ${id}:`, error);
        throw error;
    }
};

/**
 * Sends a request for edit permission for a specific Stock Register entry.
 */
export const requestStockEditPermission = async (
    id: string,
    reason: string
 ): Promise<{ message: string, editRequest: EditRequest }> => {
     if (!id || !reason) throw new Error("Stock entry ID and reason are required.");
    try {
        const response = await api.post<{ message: string, editRequest: EditRequest }>(
            `/stock-register/${id}/request-edit`,
            { requestMessage: reason }
        );
        return response.data;
    } catch (error) {
        console.error(`API Error requesting edit for stock entry ${id}:`, error);
        throw error;
    }
};


/**
 * Validates if a given Stock Register ID already exists.
 */
export const validateStockIdApi = async (id: string): Promise<{ isUnique: boolean; message: string }> => {
    if (!id) return { isUnique: false, message: 'ID is required.'};
     try {
        const response = await api.post<{ isUnique: boolean; message: string }>('/search/validate-id', {
            id: id,
            type: 'stockRegister' // Type expected by backend validation route
        });
        return response.data;
    } catch (error) {
        console.error(`API Error validating Stock Register ID ${id}:`, error);
        throw error;
    }
};