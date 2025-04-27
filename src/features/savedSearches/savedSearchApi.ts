// src/features/savedSearches/savedSearchApi.ts
import api from '../../lib/api';
import { SavedSearch, DocumentType } from '../../types'; // Use types from your definitions

// --- API Functions for Saved Searches ---

/**
 * Fetches the current user's saved searches.
 * Optionally filters by document type.
 */
export const fetchUserSavedSearches = async (
    documentType?: DocumentType | string // Allow string for query param flexibility
): Promise<{ savedSearches: SavedSearch[], count: number }> => {
    try {
        const params: { documentType?: DocumentType | string } = {};
        if (documentType) {
            params.documentType = documentType;
        }
        const response = await api.get<{ savedSearches: SavedSearch[], count: number }>('/search/saved', { params });
        return response.data;
    } catch (error) {
        console.error("API Error fetching saved searches:", error);
        throw error;
    }
};

/**
 * Fetches details of a specific saved search by its ID.
 * Note: Backend controller already enforces ownership.
 */
export const fetchSavedSearchById = async (id: string): Promise<SavedSearch> => {
     if (!id) throw new Error("Saved search ID is required.");
     try {
        const response = await api.get<SavedSearch>(`/search/saved/${id}`);
        return response.data;
    } catch (error) {
        console.error(`API Error fetching saved search ${id}:`, error);
        throw error;
    }
};


/**
 * Creates a new saved search for the current user.
 */
export const saveSearchApi = async (data: {
    name: string;
    documentType: DocumentType;
    searchParams: Record<string, any>;
}): Promise<{ message: string, savedSearch: SavedSearch }> => {
    try {
        const response = await api.post<{ message: string, savedSearch: SavedSearch }>('/search/saved', data);
        return response.data;
    } catch (error) {
        console.error("API Error saving search:", error);
        throw error;
    }
};

/**
 * Updates an existing saved search.
 * Note: Backend controller enforces ownership.
 */
 export const updateSavedSearchApi = async (id: string, data: Partial<{
    name: string;
    documentType: DocumentType;
    searchParams: Record<string, any>;
 }>): Promise<{ message: string, savedSearch: SavedSearch }> => {
     if (!id) throw new Error("Saved search ID is required for update.");
    try {
        const response = await api.put<{ message: string, savedSearch: SavedSearch }>(`/search/saved/${id}`, data);
        return response.data;
    } catch (error) {
        console.error(`API Error updating saved search ${id}:`, error);
        throw error;
    }
};


/**
 * Deletes a specific saved search by its ID.
 * Note: Backend controller enforces ownership.
 */
export const deleteSavedSearchApi = async (id: string): Promise<{ message: string }> => {
    if (!id) throw new Error("Saved search ID is required for deletion.");
    try {
        const response = await api.delete<{ message: string }>(`/search/saved/${id}`);
        return response.data;
    } catch (error) {
        console.error(`API Error deleting saved search ${id}:`, error);
        throw error;
    }
};

// Note: We also need the basic search API call from searchController
// Let's define it here or create a dedicated searchApi file. Assuming it's here for now.

/**
 * Performs the basic search via the backend.
 */
export const basicSearchApi = async (params: {
    query: string;
    type: DocumentType | string;
    page?: number;
    limit?: number;
    // Add other params like sortBy, sortOrder if needed
}): Promise<any> => { // Use a more specific type based on BasicSearchResponse later
    try {
        const response = await api.get(`/search`, { params });
        return response.data; // Returns PaginatedResponse structure for the results
    } catch (error) {
        console.error(`API Error performing basic search (Type: ${params.type}, Query: ${params.query}):`, error);
        throw error;
    }
};  