// src/types/stockRegister.ts
import { UserInfo } from './shared';

// Represents a Stock Register entry from the API
export interface StockRegister {
  id: string;
  articleName: string;
  entryDate: string; // ISO String
  companyName?: string | null;
  address?: string | null;
  productDetails?: string | null;
  voucherOrBillNumber: string;
  costRate: number;
  cgst: number;
  sgst: number;
  totalRate: number; // Usually calculated
  receiptNumber?: string | null;
  pageNumber?: number | null;
  billingDate: string; // ISO String
  photoUrl?: string | null; // Relative path
  allowEditing: boolean;
  editableUntil?: string | null; // ISO String or null
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  userId: string;

  // Included Relation
  user: UserInfo;

  // Client-side computed helper
  fullFileUrl?: string | null;
}

// Data structure for the Stock Register Form
export interface StockRegisterFormData {
  id: string;
  articleName: string;
  entryDate?: string; // 'YYYY-MM-DD'
  companyName?: string | null;
  address?: string | null;
  productDetails?: string | null;
  voucherOrBillNumber: string;
  costRate: number | string;
  cgst?: number | string;
  sgst?: number | string;
  receiptNumber?: string | null;
  pageNumber?: number | string | null;
  billingDate: string; // 'YYYY-MM-DD'
  photo?: FileList | null; // File input
}