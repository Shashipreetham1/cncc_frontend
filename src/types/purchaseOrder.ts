// src/types/purchaseOrder.ts
import { UserInfo } from './shared';

// Represents a single Item linked to a Purchase Order
export interface Item {
  id: string;
  description: string;
  quantity: number;
  rate: number;
  purchaseOrderId: string;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
}

// Represents Item data within a form
export interface ItemFormData {
   id?: string;
   description: string;
   quantity: number | string;
   rate: number | string;
}

// Represents a full Purchase Order record from the API
export interface PurchaseOrder {
  id: string;
  orderDate: string; // ISO String
  fromAddress: string;
  vendorName: string;
  contactNumber?: string | null;
  gstNumber?: string | null;
  purchaseOrderNumber: string;
  totalAmount: number;
  purchaseOrderFileUrl?: string | null; // Relative path
  allowEditing: boolean;
  editableUntil?: string | null; // ISO String or null
  createdAt: string; // ISO String
  updatedAt: string; // ISO String
  userId: string;

  // Included Relations
  items: Item[];
  user: UserInfo;

  // Client-side computed helper
  fullFileUrl?: string | null;
}

// Data structure for the Purchase Order Form
export interface PurchaseOrderFormData {
  id: string;
  orderDate: string; // 'YYYY-MM-DD'
  fromAddress: string;
  vendorName: string;
  contactNumber?: string | null;
  gstNumber?: string | null;
  purchaseOrderNumber: string;
  totalAmount: number | string;
  items: ItemFormData[];
  purchaseOrderFile?: FileList | null; // File input
}