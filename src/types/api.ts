// src/types/api.ts

// Generic structure for paginated responses from the backend
export interface PaginatedResponse<T> {
  results: T[];          // Data for the current page
  totalPages: number;     // Total pages available
  currentPage: number;    // The returned page number
  limit: number;          // Items per page requested
  totalResults: number;   // Total matching items across all pages

  // Optional metadata often included
  users?: T[];             // Specific key used by userController might differ
  invoices?: T[];          // Key might differ based on controller response
  purchaseOrders?: T[];    // Key might differ based on controller response
  stockRegisters?: T[];    // Key might differ based on controller response
  editRequests?: T[];      // Key might differ based on controller response
  savedSearches?: T[];     // Key might differ based on controller response
  count?: number;          // Alternative count field from backend

  // Optional search echo
  searchQuery?: string;
  searchType?: string;
  searchCriteria?: Record<string, any>;
}

// Common API Error structure expected from backend or Axios error response
export interface ApiErrorResponse {
  message: string;
  error?: any;
  errorDetails?: { name?: string; code?: string; message?: string; };
}

// Used for the ID validation endpoint
export interface ValidateIdResponse {
    providedId: string;
    documentType: string;
    isUnique: boolean;
    message: string;
}