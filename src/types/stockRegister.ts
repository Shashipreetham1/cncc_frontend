/**
 * src/types/stockRegister.ts
 * Defines types related to Stock Register entries.
 */
import { UserInfo } from './shared';

// Interface for Stock Register entry data (matches Prisma model + relations)
export interface StockRegister {
  fullFileUrl: string | undefined;
  id: string;
  articleName: string;
  entryDate: string;          // ISO Date string
  companyName?: string | null;
  address?: string | null;
  productDetails?: string | null;
  voucherOrBillNumber: string;
  costRate: number;
  cgst: number;
  sgst: number;
  totalRate: number;          // Backend should calculate this ideally
  receiptNumber?: string | null;
  pageNumber?: number | null;
  billingDate: string;        // ISO Date string
  photoUrl?: string | null;   // Relative URL path
  allowEditing: boolean;
  editableUntil?: string | null; // ISO Date string or null
  createdAt: string;            // ISO Date string
  updatedAt: string;            // ISO Date string
  userId: string;

  // Included Relation
  user: UserInfo;              // Info about the creator user
}

/**
 * Interface for the Stock Register form data.
 */
export interface StockRegisterFormData {
  id: string; // User-provided
  articleName: string;
  entryDate?: string; // Use string 'YYYY-MM-DD' or default to current date logic
  companyName?: string | null | undefined;
  address?: string | null | undefined;
  productDetails?: string | null | undefined;
  voucherOrBillNumber: string;
  costRate: number | string;
  cgst?: number | string; // Optional in form? Defaults to 0 in backend
  sgst?: number | string; // Optional in form? Defaults to 0 in backend
  // totalRate is calculated, not usually part of the form input
  receiptNumber?: string | null | undefined;
  pageNumber?: number | string | null | undefined; // Allow string input
  billingDate: string; // Use string 'YYYY-MM-DD' or similar
  // File input field
  photo?: FileList | null;
}