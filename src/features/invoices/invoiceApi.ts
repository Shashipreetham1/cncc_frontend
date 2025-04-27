// src/features/invoices/invoiceApi.ts
import api from '../../lib/api'; // Configured Axios instance
import { Invoice, InvoiceFormData, PaginatedResponse, EditRequest } from '../../types';

/**
 * Fetches a paginated list of invoices based on query parameters.
 * @param page - Page number
 * @param limit - Items per page
 * @param sortBy - Field to sort by
 * @param sortOrder - 'asc' or 'desc'
 * @returns Promise resolving to a PaginatedResponse of Invoices
 */
export const fetchInvoices = async (
    page = 1,
    limit = 10,
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<PaginatedResponse<Invoice>> => {
    try {
        const response = await api.get<PaginatedResponse<Invoice>>('/invoices', {
            params: { page, limit, sortBy, sortOrder },
        });
        // Add fullFileUrl client-side (or move this logic to component if preferred)
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
        response.data.results = response.data.results.map(inv => ({
            ...inv,
            fullFileUrl: inv.invoiceFileUrl ? `${backendBase}/${inv.invoiceFileUrl}` : ''
        }));
        return response.data;
    } catch (error) {
        console.error("API Error fetching invoices:", error);
        throw error; // Re-throw for component error handling
    }
};

/**
 * Fetches a single invoice by its ID.
 * @param id - The ID of the invoice to fetch.
 * @returns Promise resolving to a single Invoice object.
 */
export const fetchInvoiceById = async (id: string): Promise<Invoice> => {
     if (!id) throw new Error("Invoice ID is required.");
    try {
        const response = await api.get<Invoice>(`/invoices/${id}`);
         // Add fullFileUrl client-side
        const backendBase = import.meta.env.VITE_API_BASE_URL || '';
         if(response.data.invoiceFileUrl) {
            response.data.fullFileUrl = `${backendBase}/${response.data.invoiceFileUrl}`;
         }
        return response.data;
    } catch (error) {
        console.error(`API Error fetching invoice ${id}:`, error);
        throw error;
    }
};

/**
 * Creates a new invoice. Handles file upload via FormData.
 * @param invoiceData - The form data including the invoiceFile.
 * @returns Promise resolving to the newly created Invoice object.
 */
export const createInvoice = async (formData: FormData): Promise<Invoice> => {
    try {
        // Axios will automatically set Content-Type to multipart/form-data
        // when passed a FormData object
        const response = await api.post<Invoice>('/invoices', formData);
        return response.data;
    } catch (error) {
        console.error("API Error creating invoice:", error);
        throw error;
    }
};

/**
 * Updates an existing invoice. Handles file upload via FormData.
 * @param id - The ID of the invoice to update.
 * @param invoiceData - The form data including the (optional) new invoiceFile.
 * @returns Promise resolving to the updated Invoice object.
 */
export const updateInvoice = async (id: string, formData: FormData): Promise<Invoice> => {
     if (!id) throw new Error("Invoice ID is required for update.");
    try {
        const response = await api.put<Invoice>(`/invoices/${id}`, formData);
        return response.data;
    } catch (error) {
        console.error(`API Error updating invoice ${id}:`, error);
        throw error;
    }
};

/**
 * Deletes an invoice by its ID.
 * @param id - The ID of the invoice to delete.
 * @returns Promise resolving to the success message from the backend.
 */
export const deleteInvoice = async (id: string): Promise<{ message: string }> => {
    if (!id) throw new Error("Invoice ID is required for deletion.");
    try {
        const response = await api.delete<{ message: string }>(`/invoices/${id}`);
        return response.data;
    } catch (error) {
        console.error(`API Error deleting invoice ${id}:`, error);
        throw error;
    }
};

/**
 * Sends a request to the backend for edit permission for a specific invoice.
 * @param id - The ID of the invoice.
 * @param reason - The reason message provided by the user.
 * @returns Promise resolving to the backend response (likely includes the created EditRequest).
 */
export const requestInvoiceEditPermission = async (
    id: string,
    reason: string
 ): Promise<{ message: string, editRequest: EditRequest }> => { // Match backend controller response
     if (!id || !reason) throw new Error("Invoice ID and reason are required.");
    try {
        const response = await api.post<{ message: string, editRequest: EditRequest }>(
            `/invoices/${id}/request-edit`,
            { requestMessage: reason } // Send reason in request body
        );
        return response.data;
    } catch (error) {
        console.error(`API Error requesting edit for invoice ${id}:`, error);
        throw error;
    }
};


/**
 * Validates if a given Invoice ID already exists on the backend.
 * @param id - The ID string to validate.
 * @returns Promise resolving to an object { isUnique: boolean; message: string }.
 */
export const validateInvoiceIdApi = async (id: string): Promise<{ isUnique: boolean; message: string }> => {
    if (!id) return { isUnique: false, message: 'ID is required.'}; // Basic client-side check
    try {
        const response = await api.post<{ isUnique: boolean; message: string }>('/search/validate-id', {
            id: id,
            type: 'invoice' // Specify the document type
        });
        return response.data;
    } catch (error) {
        console.error(`API Error validating invoice ID ${id}:`, error);
        // Return as non-unique on error to be safe? Or let component handle error?
         // Let's let the component handle the error display.
        throw error;
    }
};