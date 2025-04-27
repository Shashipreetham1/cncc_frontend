// src/features/stockRegister/stockRegisterSchema.ts
import { z } from 'zod';

/**
 * Zod schema for validating the Stock Register Form data.
 */
export const stockRegisterFormSchema = z.object({
    id: z.string().trim().min(1, "Stock Register ID is required"),
    articleName: z.string().trim().min(1, "Article name is required"),
    entryDate: z.string().optional() // Let backend default or handle optional input
                .refine(val => !val || !isNaN(Date.parse(val)), { message: "Invalid entry date format" }),
    companyName: z.string().trim().optional().nullable(),
    address: z.string().trim().optional().nullable(),
    productDetails: z.string().trim().optional().nullable(),
    voucherOrBillNumber: z.string().trim().min(1, "Voucher or Bill number is required"),
    costRate: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().positive("Cost rate must be a positive number")
    ),
    cgst: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? 0 : parseFloat(String(val)),
        z.number().min(0, "CGST must be 0 or positive").optional()
    ),
    sgst: z.preprocess(
        (val) => (val === '' || val === null || val === undefined) ? 0 : parseFloat(String(val)),
        z.number().min(0, "SGST must be 0 or positive").optional()
    ),
    // totalRate is calculated in backend/frontend effect, not typically a form field
    receiptNumber: z.string().trim().optional().nullable(),
    pageNumber: z.preprocess(
         (val) => (val === '' || val === null || val === undefined) ? null : parseInt(String(val), 10),
         z.number().int().positive("Page number must be a positive whole number").nullable().optional()
    ),
    billingDate: z.string().min(1, "Billing date is required")
                  .refine(val => !isNaN(Date.parse(val)), { message: "Invalid billing date format" }),

    // File input
    photo: z.any().optional().nullable(),
});

// Export inferred TypeScript type
export type StockRegisterFormData = z.infer<typeof stockRegisterFormSchema>;