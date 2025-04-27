// src/features/purchaseOrders/purchaseOrderSchema.ts
import { z } from 'zod';

/**
 * Schema for individual items within the purchase order form.
 */
const itemSchema = z.object({
    id: z.string().optional(),
    description: z.string().trim().min(1, "Item description is required"),
    quantity: z.preprocess(
        (val) => parseInt(String(val), 10),
        z.number().int().positive("Quantity must be a positive whole number")
    ),
    rate: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().positive("Rate must be a positive number")
    ),
});

/**
 * Zod schema for validating the main Purchase Order Form data.
 */
export const purchaseOrderFormSchema = z.object({
    id: z.string().trim().min(1, "Purchase Order ID is required"),
    orderDate: z.string().min(1, "Order date is required")
                .refine(val => !isNaN(Date.parse(val)), { message: "Invalid order date format" }),
    fromAddress: z.string().trim().min(1, "Origin address is required"),
    vendorName: z.string().trim().min(1, "Vendor name is required"),
    contactNumber: z.string().trim().optional().nullable(),
    gstNumber: z.string().trim().optional().nullable(),
    purchaseOrderNumber: z.string().trim().min(1, "Purchase Order Number is required"),
    totalAmount: z.preprocess(
        (val) => parseFloat(String(val)),
        z.number().positive("Total amount must be a positive number")
    ),
    items: z.array(itemSchema).min(1, "At least one item is required"),

    // File input (optional for update, maybe required for create?)
    purchaseOrderFile: z.any().optional().nullable(),
});

// Export inferred TypeScript types
export type PurchaseOrderFormData = z.infer<typeof purchaseOrderFormSchema>;
export type ItemFormData = z.infer<typeof itemSchema>;