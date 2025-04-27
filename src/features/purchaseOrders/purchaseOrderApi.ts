// src/features/purchaseOrders/purchaseOrderApi.ts
import api from '../../lib/api';
import { PurchaseOrder, PaginatedResponse, EditRequest } from '../../types'; // Assuming PurchaseOrder defined in types/purchaseOrder.ts

/**
 * Fetches a paginated list of Purchase Orders.
 */
export const fetchPurchaseOrders = async (
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<PaginatedResponse<PurchaseOrder>> => {
    try {
        const response = await api.get<PaginatedResponse<PurchaseOrder>>('/purchase-orders', {
            params: { page, limit, sortBy, sortOrder },
        });
        // Add fullFileUrl client-side
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
        response.data.results = response.data.results.map(po => ({
            ...po,
            fullFileUrl: po.purchaseOrderFileUrl ? `${backendBase}/${po.purchaseOrderFileUrl}` : ''
        }));
        return response.data;
    } catch (error) {
        console.error("API Error fetching purchase orders:", error);
        throw error;
    }
};

/**
 * Fetches a single Purchase Order by its ID.
 */
export const fetchPurchaseOrderById = async (id: string): Promise<PurchaseOrder> => {
     if (!id) throw new Error("Purchase Order ID is required.");
    try {
        const response = await api.get<PurchaseOrder>(`/purchase-orders/${id}`);
        // Add fullFileUrl client-side
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
        if(response.data.purchaseOrderFileUrl) {
            response.data.fullFileUrl = `${backendBase}/${response.data.purchaseOrderFileUrl}`;
        }
        return response.data;
    } catch (error) {
        console.error(`API Error fetching purchase order ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new Purchase Order. Handles file upload via FormData.
 */
export const createPurchaseOrder = async (formData: FormData): Promise<PurchaseOrder> => {
    try {
        const response = await api.post<PurchaseOrder>('/purchase-orders', formData, {
             headers: { 'Content-Type': 'multipart/form-data' } // Set explicitly for clarity
        });
        return response.data;
    } catch (error) {
        console.error("API Error creating purchase order:", error);
        throw error;
    }
};

/**
 * Updates an existing Purchase Order. Handles file upload via FormData.
 */
export const updatePurchaseOrder = async (id: string, formData: FormData): Promise<PurchaseOrder> => {
     if (!id) throw new Error("Purchase Order ID is required for update.");
    try {
        const response = await api.put<PurchaseOrder>(`/purchase-orders/${id}`, formData, {
             headers: { 'Content-Type': 'multipart/form-data' }
        });
        return response.data;
    } catch (error) {
        console.error(`API Error updating purchase order ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes a Purchase Order by its ID.
 */
export const deletePurchaseOrder = async (id: string): Promise<{ message: string }> => {
    if (!id) throw new Error("Purchase Order ID is required for deletion.");
    try {
        const response = await api.delete<{ message: string }>(`/purchase-orders/${id}`);
        return response.data;
    } catch (error) {
        console.error(`API Error deleting purchase order ${id}:`, error);
        throw error;
    }
};

/**
 * Sends a request for edit permission for a specific Purchase Order.
 */
export const requestPurchaseOrderEditPermission = async (
    id: string,
    reason: string
 ): Promise<{ message: string, editRequest: EditRequest }> => {
     if (!id || !reason) throw new Error("Purchase Order ID and reason are required.");
    try {
        const response = await api.post<{ message: string, editRequest: EditRequest }>(
            `/purchase-orders/${id}/request-edit`,
            { requestMessage: reason }
        );
        return response.data;
    } catch (error) {
        console.error(`API Error requesting edit for purchase order ${id}:`, error);
        throw error;
    }
};

/**
 * Validates if a given Purchase Order ID already exists.
 */
export const validatePurchaseOrderIdApi = async (id: string): Promise<{ isUnique: boolean; message: string }> => {
     if (!id) return { isUnique: false, message: 'ID is required.'};
     try {
        const response = await api.post<{ isUnique: boolean; message: string }>('/search/validate-id', {
            id: id,
            type: 'purchaseOrder' // Use type expected by backend
        });
        return response.data;
    } catch (error) {
        console.error(`API Error validating PO ID ${id}:`, error);
        throw error;
    }
};