// src/features/savedSearches/saveSearchSchema.ts
import { z } from 'zod';
import { DocumentType } from '../../types'; // Assuming DocumentType defined in types/search.ts

const documentTypeEnum = z.enum(['INVOICE', 'PURCHASE_ORDER', 'STOCK_REGISTER']);

/**
 * Zod schema for validating the Save Search form (inside the modal).
 */
export const saveSearchFormSchema = z.object({
  name: z.string().trim().min(1, "A name for the saved search is required"),

  // Fields pre-populated/read-only in the modal based on current search, but still good to include
  documentType: documentTypeEnum,
  searchParams: z.record(z.any()).or(z.unknown()), // Store as JSON object or unknown if complex
});

// Export the inferred TypeScript type
export type SaveSearchFormData = z.infer<typeof saveSearchFormSchema>;