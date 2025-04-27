// src/lib/utils.ts

/**
 * Placeholder file for utility functions.
 */

// Example utility: Format date string (customize as needed)
export const formatDate = (dateString?: string | null, options?: Intl.DateTimeFormatOptions): string => {
    if (!dateString) {
      return 'N/A';
    }
    try {
      const defaultOptions: Intl.DateTimeFormatOptions = {
        year: 'numeric', month: 'short', day: 'numeric',
        // hour: '2-digit', minute: '2-digit', // Optionally include time
        ...options // Allow overriding defaults
      };
      return new Date(dateString).toLocaleDateString(undefined, defaultOptions);
    } catch (error) {
      console.error("Error formatting date:", dateString, error);
      return 'Invalid Date';
    }
  };
  
  // Add other general utility functions here (e.g., string manipulation, debouncing, etc.)