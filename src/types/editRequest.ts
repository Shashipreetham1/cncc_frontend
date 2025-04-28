// src/types/editRequest.ts
import { UserInfo } from './shared';

// Matches backend Enum
export type EditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Minimal info about the linked document shown in lists/notifications
interface LinkedDocumentInfo {
    id: string;
    companyName?: string;          // For Invoice
    purchaseOrderNumber?: string; // For PO
    articleName?: string;          // For Stock Register
}

// Represents an Edit Request record from the API
export interface EditRequest {
  id: string;
  status: EditRequestStatus;
  requestMessage?: string | null;
  responseMessage?: string | null;
  createdAt: string; // ISO String
  updatedAt: string; // ISO String

  // Foreign keys (only one will be non-null)
  invoiceId?: string | null;
  purchaseOrderId?: string | null;
  stockRegisterId?: string | null;

  // Relations
  requestedBy: UserInfo;
  adminUser?: UserInfo | null; // Admin who processed it

  // Linked document summary (add based on backend response include clause)
  invoice?: LinkedDocumentInfo | null;
  purchaseOrder?: LinkedDocumentInfo | null;
  stockRegister?: LinkedDocumentInfo | null;

  // Client-side helpers added by fetch logic
  documentTypeLabel?: string;
  documentId?: string | null;
}

// Form data when user *submits* a request
export interface EditRequestFormData {
  requestMessage: string;
}

// Form data when admin *responds* to a request
export interface EditRequestAdminResponseFormData {
    responseMessage: string; // Reason required for both approve/reject potentially
}