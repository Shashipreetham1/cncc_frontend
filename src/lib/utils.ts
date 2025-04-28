// src/lib/utils.ts

/**
 * Formats an ISO date string or Date object into a more readable format.
 * Handles null/undefined input gracefully.
 *
 * @param dateInput - The date string (ISO 8601 format) or Date object.
 * @param options - Optional Intl.DateTimeFormatOptions to customize output.
 * @returns Formatted date string or 'N/A'.
 */
export const formatDate = (
  dateInput?: string | null | Date,
  options?: Intl.DateTimeFormatOptions
): string => {
  if (!dateInput) {
      return 'N/A';
  }

  try {
      // Default options: e.g., "May 24, 2024" or locale equivalent
      const defaultOptions: Intl.DateTimeFormatOptions = {
          year: 'numeric',
          month: 'short', // 'long' for full month name, '2-digit' for MM
          day: 'numeric', // '2-digit' for DD
          // timeZone: 'UTC', // Specify timezone if dates from DB are UTC and you want consistency
          ...options // User options override defaults
      };

      const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;

      // Check if date is valid after parsing
      if (isNaN(date.getTime())) {
          throw new Error("Invalid date value");
      }

      return date.toLocaleDateString(undefined, defaultOptions); // Uses browser's default locale
  } catch (error) {
      console.error("Error formatting date:", dateInput, error);
      return 'Invalid Date';
  }
};

/**
* Formats an ISO date string or Date object for use in an <input type="date"> field (YYYY-MM-DD).
* Handles null/undefined input gracefully.
*
* @param dateInput - The date string (ISO 8601 format) or Date object.
* @returns Formatted date string in 'YYYY-MM-DD' format or empty string.
*/
export const formatInputDate = (dateInput?: string | null | Date): string => {
  if (!dateInput) {
      return ''; // Return empty string for input value
  }
  try {
       const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
      if (isNaN(date.getTime())) {
          throw new Error("Invalid date value");
      }
       // Get parts respecting timezone of the Date object (usually local)
      const year = date.getFullYear();
      const month = (date.getMonth() + 1).toString().padStart(2, '0'); // Month is 0-indexed
      const day = date.getDate().toString().padStart(2, '0');

      return `${year}-${month}-${day}`;
  } catch (error) {
       console.error("Error formatting input date:", dateInput, error);
      return ''; // Return empty on error
  }
};


/**
* Placeholder for adding other utility functions, e.g.:
* - debounce(func, wait)
* - capitalizeFirstLetter(string)
* - formatCurrency(number)
*/