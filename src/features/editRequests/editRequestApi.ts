// src/features/editRequests/editRequestApi.ts
import api from '../../lib/api';
import { EditRequest, PaginatedResponse, EditRequestStatus } from '../../types';

/**
 * Fetches a paginated list of edit requests, optionally filtered by status.
 * Admin only (enforced by backend middleware).
 */
export const fetchEditRequests = async (
    page = 1,
    limit = 15,
    status?: EditRequestStatus | 'ALL', // 'ALL' or specific status
    sortBy = 'createdAt',
    sortOrder = 'desc'
): Promise<PaginatedResponse<EditRequest>> => {
    try {
        const params: any = { page, limit, sortBy, sortOrder };
        if (status && status !== 'ALL') {
            params.status = status;
        }
        // Backend route is /api/edit-requests
        const response = await api.get<PaginatedResponse<EditRequest>>('/edit-requests', { params });

        // Optionally add document type label client-side for easier display
        response.data.results = response.data.results.map(req => ({
            ...req,
             documentTypeLabel: req.invoiceId ? 'Invoice' : req.purchaseOrderId ? 'Purchase Order' : req.stockRegisterId ? 'Stock Register' : 'Unknown',
             documentId: req.invoiceId || req.purchaseOrderId || req.stockRegisterId || 'N/A'
        }));

        return response.data;
    } catch (error) {
        console.error("API Error fetching edit requests:", error);
        throw error;
    }
};

/**
 * Approves a specific edit request (Admin Only).
 * @param editRequestId - The ID of the request to approve.
 * @param responseMessage - Optional admin message.
 * @returns Promise resolving to the updated EditRequest.
 */
export const approveEditRequestApi = async (
    editRequestId: string,
    responseMessage?: string
): Promise<{ message: string, editRequest: EditRequest }> => {
    if (!editRequestId) throw new Error("Edit Request ID is required for approval.");
    try {
        // Backend route PUT /api/edit-requests/:id/approve
        const response = await api.put<{ message: string, editRequest: EditRequest }>(
            `/edit-requests/${editRequestId}/approve`,
             { responseMessage } // Send optional message in body
        );
        return response.data;
    } catch (error) {
        console.error(`API Error approving edit request ${editRequestId}:`, error);
        throw error;
    }
};

/**
 * Rejects a specific edit request (Admin Only).
 * @param editRequestId - The ID of the request to reject.
 * @param responseMessage - REQUIRED admin reason for rejection.
 * @returns Promise resolving to the updated EditRequest.
 */
export const rejectEditRequestApi = async (
    editRequestId: string,
    responseMessage: string
 ): Promise<{ message: string, editRequest: EditRequest }> => {
     if (!editRequestId) throw new Error("Edit Request ID is required for rejection.");
     if (!responseMessage || responseMessage.trim() === '') throw new Error("A reason (responseMessage) is required for rejection.");
     try {
        // Backend route PUT /api/edit-requests/:id/reject
         const response = await api.put<{ message: string, editRequest: EditRequest }>(
             `/edit-requests/${editRequestId}/reject`,
             { responseMessage } // Send mandatory message in body
         );
         return response.data;
     } catch (error) {
         console.error(`API Error rejecting edit request ${editRequestId}:`, error);
         throw error;
     }
 };

 // Optional: Fetch single edit request details (backend already implemented)
 // export const fetchEditRequestDetails = async (id: string): Promise<EditRequest> => { ... }