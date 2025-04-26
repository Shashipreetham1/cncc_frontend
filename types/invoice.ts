// Match your Prisma schema
export interface Product {
    id?: string; // Optional for creation
    productName: string;
    serialNumber?: string | null;
    warrantyYears?: number;
    quantity: number;
    price: number;
    // createdAt?: string; // Usually excluded from forms
    // updatedAt?: string;
    invoiceId?: string;
}

export interface UserInfo {
    id: string;
    username: string;
}

export interface Invoice {
    id: string;
    purchaseDate: string; // Keep as string for simplicity or use Date object
    companyName: string;
    orderOrSerialNumber?: string | null;
    vendorName: string;
    contactNumber?: string | null;
    address: string;
    invoiceFileUrl?: string | null; // Path from backend
    additionalDetails?: string | null;
    allowEditing: boolean;
    editableUntil?: string | null; // ISO date string or null
    totalAmount: number;
    createdAt: string;
    updatedAt: string;
    userId: string;
    products: Product[];
    user: UserInfo;
    // Add computed fields if helpful for UI
    fullFileUrl?: string | null;
    displayFilename?: string | null;
}

 // Type for React Hook Form data
 export interface InvoiceFormData {
    id: string; // User-provided ID
    purchaseDate: string; // Use string type compatible with date input
    companyName: string;
    orderOrSerialNumber?: string | null;
    vendorName: string;
    contactNumber?: string | null;
    address: string;
    additionalDetails?: string | null;
    totalAmount: number | string; // Allow string during input
    products: Product[]; // Array of products
    invoiceFile?: FileList | null; // For the file input
}