// src/features/invoices/invoiceSchema.ts
import { z } from 'zod';

// --- Validation Schemas using Zod ---

/**
 * Schema for individual product line items within the invoice form.
 */
const productSchema = z.object({
    id: z.string().optional(), // Optional: only present for existing products during update
    productName: z.string().trim().min(1, "Product name is required"),
    serialNumber: z.string().trim().optional().nullable(),
    warrantyYears: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? 0 : parseInt(String(val), 10), // Ensure number, default 0
        z.number().int().min(0, "Warranty years must be 0 or positive").optional()
    ),
    quantity: z.preprocess(
        (val) => parseInt(String(val), 10),
        z.number().int().positive("Quantity must be a positive whole number")
    ),
    price: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().positive("Price must be a positive number")
    ),
});

/**
 * Zod schema for validating the main Invoice Form data.
 */
export const invoiceFormSchema = z.object({
    id: z.string().trim().min(1, "Invoice ID is required"),
    purchaseDate: z.string().min(1, "Purchase date is required")
                   .refine(val => !isNaN(Date.parse(val)), { message: "Invalid purchase date format" }), // Basic date format check
    companyName: z.string().trim().min(1, "Company name is required"),
    orderOrSerialNumber: z.string().trim().optional().nullable(),
    vendorName: z.string().trim().min(1, "Vendor name is required"),
    contactNumber: z.string().trim().optional().nullable(),
    address: z.string().trim().min(1, "Address is required"),
    additionalDetails: z.string().trim().optional().nullable(),
    totalAmount: z.preprocess(
        (val) => parseFloat(String(val)), // Convert string input to number
        z.number().positive("Total amount must be a positive number")
    ),
    // Validate the products array: must be an array with at least one product
    products: z.array(productSchema).min(1, "At least one product is required"),

    // File input validation (optional - check if file exists and maybe type/size)
    invoiceFile: z.any() // Basic check - Use optional() if file not always required
                // Add .refine for more complex checks if needed:
                // .refine(files => files?.[0]?.size <= MAX_FILE_SIZE, `Max file size is 5MB.`)
                // .refine(files => ACCEPTED_IMAGE_TYPES.includes(files?.[0]?.type), ".jpg, .jpeg, .png and .webp files are accepted.")
                .optional().nullable(),
});


// Export the inferred TypeScript type for form data
export type InvoiceFormData = z.infer<typeof invoiceFormSchema>;

// Export ProductFormData type separately if needed elsewhere
export type ProductFormData = z.infer<typeof productSchema>;