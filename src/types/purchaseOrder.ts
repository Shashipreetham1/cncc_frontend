/**
 * src/types/purchaseOrder.ts
 * Defines types related to Purchase Orders and Items.
 */
import { UserInfo } from './shared';

// Interface for Item data (matches Prisma model)
export interface Item {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  purchaseOrderId: string; // Foreign key back to PurchaseOrder
  createdAt: string;       // ISO Date string
  updatedAt: string;       // ISO Date string
}

// Interface for Item data within a form context
export interface ItemFormData {
   id?: string; // Optional: Only for updates within form
   description: string;
   quantity: number | string;
   rate: number | string;
}

// Interface for Purchase Order data (matches Prisma model + relations)
export interface PurchaseOrder {
  fullFileUrl: string;
  id: string;
  orderDate: string;         // ISO Date string
  fromAddress: string;
  vendorName: string;
  contactNumber?: string | null;
  gstNumber?: string | null;
  purchaseOrderNumber: string; // Should be unique based on schema
  totalAmount: number;
  purchaseOrderFileUrl?: string | null; // Relative URL path
  allowEditing: boolean;
  editableUntil?: string | null; // ISO Date string or null
  createdAt: string;         // ISO Date string
  updatedAt: string;         // ISO Date string
  userId: string;

  // Included Relations
  items: Item[];             // Array of associated Item objects
  user: UserInfo;            // Info about the creator user
}

/**
 * Interface for the Purchase Order form data.
 */
export interface PurchaseOrderFormData {
  id: string; // User-provided
  orderDate: string; // Use string 'YYYY-MM-DD' or similar
  fromAddress: string;
  vendorName: string;
  contactNumber: string | null | undefined;
  gstNumber: string | null | undefined;
  purchaseOrderNumber: string;
  totalAmount: number | string;
  // Use ItemFormData for nested items in the form array
  items: ItemFormData[];
  // File input field
  purchaseOrderFile?: FileList | null;
}