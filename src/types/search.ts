/**
 * src/types/search.ts
 * Defines types related to Search functionality, including Saved Searches.
 */
import { UserInfo } from './shared'; // Only if user info included in SavedSearch response

// Define Document Types matching backend enum
export type DocumentType = 'INVOICE' | 'PURCHASE_ORDER' | 'STOCK_REGISTER';

// Interface for Saved Search data (matches Prisma model)
export interface SavedSearch {
  id: string;
  name: string;
  documentType: DocumentType; // The specific type this search applies to
  // Using Record<string, any> for flexibility, could use a more specific type
  // if search parameter structure is strictly defined. `unknown` is safer.
  searchParams: Record<string, any> | unknown;
  createdAt: string;         // ISO Date string
  updatedAt: string;         // ISO Date string
  userId: string;            // Foreign key

  // user?: UserInfo; // Optional: Only if backend includes user relation
}

/**
 * Interface for the form data when creating or updating a Saved Search.
 */
export interface SavedSearchFormData {
    name: string;
    documentType: DocumentType;
    searchParams: Record<string, any> | unknown; // The criteria object
}

/**
 * Structure for basic search results from the backend searchDocuments endpoint.
 * T could be Invoice, PurchaseOrder, StockRegister with an added documentType.
 */
 export type GenericDocument = Record<string, any> & { documentType: string };

 export interface BasicSearchResponse {
     searchQuery: string;
     searchType: string;
     results: GenericDocument[];
     totalPages: number;
     currentPage: number;
     limit: number;
     totalResults: number;
 }

 // Interface for advanced search results can extend PaginatedResponse
 // import { PaginatedResponse } from './api';
 // export interface AdvancedSearchResponse<T> extends PaginatedResponse<T> {
 //     searchCriteria?: Record<string, any>;
 // }