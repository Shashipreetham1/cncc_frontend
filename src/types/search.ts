// src/types/search.ts

// Matches backend Enum
export type DocumentType = 'INVOICE' | 'PURCHASE_ORDER' | 'STOCK_REGISTER';

// Represents a Saved Search record from the API
export interface SavedSearch {
  id: string;
  name: string;
  documentType: DocumentType;
  // Use Record<string, any> for flexible criteria structure
  // `unknown` forces type checks before use
  searchParams: Record<string, any> | unknown;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  userId: string; // Belongs to specific user
}

// Data structure for the Save Search form
export interface SavedSearchFormData {
    name: string;
    // These are often pre-filled based on current search context in the modal
    documentType: DocumentType;
    searchParams: Record<string, any> | unknown;
}

/**
 * Generic structure for a document returned by basic search.
 * Will be one of Invoice, PurchaseOrder, or StockRegister + documentType indicator.
 */
export type GenericDocument = Record<string, any> & {
    id: string; // Ensure ID exists
    documentType: string; // 'invoice', 'purchaseOrder', or 'stockRegister'
    createdAt: string; // Ensure createdAt for sorting if needed
    // Add specific fields expected in search result cards/rows
    invoiceFileUrl?: string | null;
    purchaseOrderFileUrl?: string | null;
    photoUrl?: string | null;
    fullFileUrl?: string | null; // Client-side added
    companyName?: string;
    vendorName?: string;
    articleName?: string;
    purchaseOrderNumber?: string;
    // etc.
};

// Structure returned by the basic search API endpoint
export interface BasicSearchResponse {
    searchQuery: string;
    searchType: string;
    results: GenericDocument[];
    totalPages: number;
    currentPage: number;
    limit: number;
    totalResults: number;
}