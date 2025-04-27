import { z } from 'zod'; // Import Zod

/**
 * Zod schema for login form validation.
 */
export const loginSchema = z.object({
  username: z
        .string()
        .trim() // Remove leading/trailing whitespace
        .min(1, { message: 'Username is required' }), // Ensure it's not empty

  password: z
        .string()
        .min(6, { message: 'Password must be at least 6 characters long' }) // Match backend minimum requirement if any
        .min(1, { message: 'Password is required' }), // Ensure not empty (min(1) better than .nonempty())

  // Add other fields if your login form has them (e.g., 'remember me')
  // rememberMe: z.boolean().optional(),
});

// Export the inferred TypeScript type from the schema
export type LoginFormInputs = z.infer<typeof loginSchema>;