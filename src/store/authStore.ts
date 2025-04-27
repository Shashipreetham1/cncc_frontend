import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
// Assuming you have defined Role in a shared types file, or define it here
// import { Role } from '../types/shared'; // Example path

// Define Role enum if not imported from shared types
export type Role = 'ADMIN' | 'USER';

/**
 * Interface representing the authenticated user data stored in the state.
 * Should match the minimal user object returned by the backend login/profile endpoints.
 */
export interface User {
  id: string;
  username: string;
  role: Role;
}

/**
 * Interface defining the shape of the authentication state and actions.
 */
interface AuthState {
  // State properties
  user: User | null;            // Currently logged-in user object or null
  token: string | null;         // JWT authentication token or null
  isAuthenticated: boolean;     // Derived: True if token & user exist
  isAdmin: boolean;             // Derived: True if user role is ADMIN
  isLoading: boolean;           // Tracks if auth state is being checked (e.g., on initial load)

  // Actions to modify state
  login: (token: string, user: User) => void; // Action when user successfully logs in
  logout: () => void;         // Action to clear user session
  setUser: (user: User | null) => void;      // Action to update user info (e.g., after profile update)
  setToken: (token: string | null) => void;  // Action to update token (rarely used directly)
  setLoading: (loading: boolean) => void;  // Action to update loading status
  hydrate: () => void;        // Action called by App component to signify hydration check is complete
}

/**
 * Zustand store for managing authentication state.
 * - Persists `user` and `token` to localStorage.
 * - Automatically computes `isAuthenticated` and `isAdmin`.
 * - Provides actions to update the state.
 */
export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // --- Initial State ---
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true, // Start in loading state until hydration check completes

      // --- Actions ---
      login: (token, user) => {
        console.log("Attempting to log in user:", user.username, "Role:", user.role);
        // Directly update state
        set({
          token: token,
          user: user,
          isAuthenticated: true,             // Derived state updates automatically below
          isAdmin: user.role === 'ADMIN',  // Derived state updates automatically below
          isLoading: false,                // Login complete, no longer loading
        });
         console.log("Auth state updated after login.");
      },

      logout: () => {
        console.log("Logging out user.");
         // Clear authentication state
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false, // Logout complete
        });
         // Persist middleware will clear localStorage automatically
      },

      setUser: (user) => {
          // Update user details, recalculate auth/admin status
          console.log("Setting user data:", user?.username);
          set((state) => ({
              user,
              isAdmin: user?.role === 'ADMIN',
              // isAuthenticated depends on both user AND token being present
              isAuthenticated: !!user && !!state.token
          }));
      },

      setToken: (token) => {
         // Update token, recalculate auth status
         console.log("Setting token:", token ? "Exists" : "Null");
         set((state) => ({
             token,
              // isAuthenticated depends on both user AND token being present
             isAuthenticated: !!token && !!state.user
         }));
      },

       setLoading: (loading) => {
         // Manually set loading state if needed for complex flows
         // console.log("Setting loading state:", loading);
         set({ isLoading: loading });
      },

       hydrate: () => {
            // Called from App.tsx after mount to indicate initial state check is done
            // Allows components to react correctly after persisted state is loaded.
             // console.log("Hydrate action called, setting isLoading to false.");
             set({ isLoading: false });
       }

    }),
    {
      // --- Persist Middleware Configuration ---
      name: 'cncc-auth-storage', // Unique name for the localStorage key
      storage: createJSONStorage(() => localStorage), // Use localStorage

      // Only persist 'user' and 'token'. Other fields are derived or transient.
      partialize: (state) => ({
          user: state.user,
          token: state.token,
      }),

       // Custom function executed after state is rehydrated from storage
      onRehydrateStorage: () => {
         console.log("Auth state hydration started from localStorage...");
         return (state, error) => {
             if (error) {
                 console.error("Error rehydrating auth state:", error);
                  // If error, maybe force logout?
                  state?.logout();
             } else if (state) {
                 // Re-derive computed state after loading from storage
                  state.isAuthenticated = !!state.token && !!state.user;
                  state.isAdmin = state.user?.role === 'ADMIN';
                  // isLoading is set to false via the hydrate() action call in App.tsx
                 // state.isLoading = false; // Can set here too, but App.tsx is cleaner control point
                 console.log("Auth state successfully rehydrated:", { tokenExists: !!state.token, userExists: !!state.user });
            }
         };
       },
    }
  )
);

// Optional: Log initial state (useful for debugging hydration)
// console.log("Initial Auth State:", useAuthStore.getState());