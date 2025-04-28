// src/features/dashboard/dashboardApi.ts
import api from '../../lib/api'; // Import the configured Axios instance

// Define the structure of the data expected from the backend summary endpoint
export interface DashboardSummary {
    totalInvoices: number;
    totalPurchaseOrders: number;
    totalStockEntries: number;
    pendingEditRequests: number; // Count relevant to the logged-in user (0 for non-admins)
    // Add any other counts or summary data points the backend might provide
}

/**
 * Fetches the dashboard summary data from the backend API endpoint.
 * Handles potential API errors.
 * @returns Promise resolving to the DashboardSummary object.
 */
export const fetchDashboardSummary = async (): Promise<DashboardSummary> => {
    console.log("Fetching dashboard summary from GET /api/dashboard/summary");
    try {
        // Make the GET request to the dedicated summary endpoint
        const response = await api.get<DashboardSummary>('/dashboard/summary');

        // Log the received data for debugging (optional)
        console.log("Dashboard summary data received from backend:", response.data);

        // Return the data part of the response which should match DashboardSummary
        return response.data;

    } catch (error: any) {
        // Log the detailed error
        console.error("❌ API Error fetching dashboard summary:", error);

        // Create a user-friendly error message
        const errorMessage = error.response?.data?.message || // Use message from backend if available
                             error.message ||                 // Fallback to Axios error message
                             "Failed to fetch dashboard summary data."; // Generic fallback

        // Re-throw a standard Error object for the component to catch
        throw new Error(errorMessage);
    }
};