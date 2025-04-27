/**
 * src/types/invoice.ts
 * Defines types related to Invoices and Products.
 */
import { UserInfo } from './shared'; // Import shared UserInfo

// Interface for Product data (matches Prisma model)
export interface Product {
  id: string;                 // Primary Key from DB (always present on fetched data)
  productName: string;
  serialNumber?: string | null;
  warrantyYears: number;
  quantity: number;
  price: number;
  invoiceId: string;           // Foreign key back to Invoice
  createdAt: string;           // ISO Date string
  updatedAt: string;           // ISO Date string
}

// Interface for Product data within a form context (ID optional for new products)
export interface ProductFormData {
  id?: string; // Optional: Only present if updating an existing product within the form
  productName: string;
  serialNumber?: string | null;
  warrantyYears?: number | string; // Allow string for input field
  quantity: number | string;      // Allow string for input field
  price: number | string;         // Allow string for input field
}

// Interface for Invoice data (matches Prisma model + relations)
export interface Invoice {
  fullFileUrl: string;
  id: string;                 // Primary Key (User-provided on creation)
  purchaseDate: string;       // ISO Date string
  companyName: string;
  orderOrSerialNumber?: string | null;
  vendorName: string;
  contactNumber?: string | null;
  address: string;
  invoiceFileUrl?: string | null; // Relative URL path from backend
  additionalDetails?: string | null;
  allowEditing: boolean;          // Backend permission flag
  editableUntil?: string | null;   // ISO Date string or null
  totalAmount: number;
  createdAt: string;            // ISO Date string
  updatedAt: string;            // ISO Date string
  userId: string;               // Foreign key to User

  // Included Relations
  products: Product[];         // Array of associated Product objects
  user: UserInfo;              // Information about the creator user

  // Optional Frontend Computed Fields (add in frontend logic if needed)
  // fullFileUrl?: string | null;
  // displayFilename?: string | null;
}

/**
 * Interface defining the data structure for the Invoice form,
 * suitable for React Hook Form. Matches backend requirements for create/update.
 */
export interface InvoiceFormData {
  id: string; // User MUST provide ID on creation/update
  purchaseDate: string; // Use string 'YYYY-MM-DD' or similar compatible with <input type="date">
  companyName: string;
  orderOrSerialNumber: string | null | undefined;
  vendorName: string;
  contactNumber: string | null | undefined;
  address: string;
  additionalDetails: string | null | undefined;
  totalAmount: number | string; // Use string during input, parse before sending
  // Use ProductFormData for nested items in the form array
  products: ProductFormData[];
  // File input field - note: FileList is type for <input type="file"> value
  invoiceFile?: FileList | null;
}