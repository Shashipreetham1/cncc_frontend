// src/types/invoice.ts
import { UserInfo } from './shared';

// Represents a single Product item linked to an Invoice
export interface Product {
  id: string;
  productName: string;
  serialNumber?: string | null;
  warrantyYears: number;
  quantity: number;
  price: number;
  invoiceId: string;
  createdAt: string;
  updatedAt: string;
}

// Represents Product data structure within a form (ID optional)
export interface ProductFormData {
  id?: string;
  productName: string;
  serialNumber?: string | null;
  warrantyYears?: number | string; // Allow string from input
  quantity: number | string;
  price: number | string;
}

// Represents a full Invoice record from the API
export interface Invoice {
  id: string;
  purchaseDate: string; // ISO String
  companyName: string;
  orderOrSerialNumber?: string | null;
  vendorName: string;
  contactNumber?: string | null;
  address: string;
  invoiceFileUrl?: string | null; // Relative path
  additionalDetails?: string | null;
  allowEditing: boolean;
  editableUntil?: string | null; // ISO String or null
  totalAmount: number;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  userId: string;

  // Included Relations
  products: Product[];
  user: UserInfo;

  // Client-side computed helper field
  fullFileUrl?: string | null;
}

// Data structure for the Invoice Form using React Hook Form
export interface InvoiceFormData {
  id: string;
  purchaseDate: string; // 'YYYY-MM-DD'
  companyName: string;
  orderOrSerialNumber?: string | null;
  vendorName: string;
  contactNumber?: string | null;
  address: string;
  additionalDetails?: string | null;
  totalAmount: number | string;
  products: ProductFormData[];
  invoiceFile?: FileList | null; // File input
}