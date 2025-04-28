/**
 * src/types/index.ts
 * Barrel file re-exporting all types for easier importing across the app.
 * Example: import { Invoice, Product, Role, EditRequestStatus } from './types';
 */

export * from './shared';
export * from './api';
export * from './invoice';
export * from './purchaseOrder';
export * from './stockRegister';
export * from './editRequest'; // This already exports EditRequestStatus type if defined correctly inside
export * from './search';
// Re-export User type from store if needed globally
// Use cautiously to avoid tight coupling to store structure everywhere
export type { User as AuthUser } from '../store/authStore';
// Explicitly re-export Role if needed often (optional, already in shared)
export type { Role } from './shared';