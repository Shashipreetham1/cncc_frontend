/**
 * src/types/editRequest.ts
 * Defines types related to Edit Requests.
 */
import { UserInfo } from './shared';
import { Invoice } from './invoice';         // Import base types if showing full doc
import { PurchaseOrder } from './purchaseOrder';
import { StockRegister } from './stockRegister';

// Define Edit Request Status matching backend enum
export type EditRequestStatus = 'PENDING' | 'APPROVED' | 'REJECTED';

// Base interface for linked document snippet (for context in lists)
interface LinkedDocumentInfo {
    id: string;
    // Include a distinguishing field
    companyName?: string; // For Invoice
    purchaseOrderNumber?: string; // For PO
    articleName?: string; // For StockRegister
}

// Interface for Edit Request data (matches Prisma model + relations)
export interface EditRequest {
  documentId: any;
  documentTypeLabel: any;
  id: string;
  status: EditRequestStatus;
  requestMessage?: string | null;
  responseMessage?: string | null;
  createdAt: string;            // ISO Date string
  updatedAt: string;            // ISO Date string

  // IDs linking to the document (only one will be present)
  invoiceId?: string | null;
  purchaseOrderId?: string | null;
  stockRegisterId?: string | null;

  // Included Relations (UserInfo for brevity, or full types if needed)
  requestedBy: UserInfo;         // User who made the request
  adminUser?: UserInfo | null;   // Admin who processed it (optional)

  // Include basic info of the linked document for display context
  invoice?: LinkedDocumentInfo | null;
  purchaseOrder?: LinkedDocumentInfo | null;
  stockRegister?: LinkedDocumentInfo | null;

  // Or include full document if needed on specific views
  // invoice?: Invoice | null;
  // purchaseOrder?: PurchaseOrder | null;
  // stockRegister?: StockRegister | null;
}

/**
 * Interface for the form data when a user SUBMITS an edit request.
 */
export interface EditRequestFormData {
  requestMessage: string; // The reason/message for the request
  // documentId and documentType are typically passed via route params or context
}

/**
 * Interface for the form data when an ADMIN APPROVES/REJECTS an edit request.
 */
export interface EditRequestAdminResponseFormData {
    responseMessage: string; // Justification for approval or rejection
}