/**
 * src/types/shared.ts
 * Contains common types used across different features.
 */

// Define user roles matching the backend Role enum
export type Role = 'ADMIN' | 'USER';

/**
 * Minimal user information, often included in related data or for display.
 */
export interface UserInfo {
  id: string;
  username: string;
  role?: Role; // Include role if backend sends it in nested user objects
}

// Interface for basic select options (e.g., for dropdowns)
export interface SelectOption {
  value: string | number;
  label: string;
}