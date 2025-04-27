/**
 * src/types/api.ts
 * Defines common structures for API responses, especially pagination.
 */

/**
 * Structure for paginated API list responses.
 * Contains the data for the current page and pagination metadata.
 * T represents the type of the items in the results array (e.g., Invoice, User).
 */
export interface PaginatedResponse<T> {
    totalRequests: number;
    results: T[];       // The array of items for the current page
    totalPages: number;  // Total number of pages available
    currentPage: number; // The current page number that was returned
    limit: number;       // The number of items requested per page (from request)
    totalResults: number;// Total number of items matching the query criteria
    // Optional: Include search criteria echo if needed
    searchQuery?: string;
    searchType?: string;
    searchCriteria?: Record<string, any>;
  }
  
  /**
   * Standard API error response structure (customize as needed).
   * Axios errors often have error.response.data matching this.
   */
  export interface ApiErrorResponse {
    message: string;          // User-friendly error message
    error?: any;              // More technical error details (optional, esp. in dev)
    errorDetails?: {          // More structured details if provided by backend
        name?: string;
        code?: string;
        message?: string;
    };
    // Add specific validation error structure if your backend provides it
    // validationErrors?: { [key: string]: string[] };
  }
  
  // You can add other common API-related types here if necessary