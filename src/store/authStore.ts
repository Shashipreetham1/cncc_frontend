import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define the shape of your User object (mirror backend response)
interface User {
  id: string;
  username: string;
  role: 'ADMIN' | 'USER'; // Use role from your backend
  // Add other fields if needed/returned by backend profile endpoint
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Track loading state during auth operations
  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  setLoading: (loading: boolean) => void;
  hydrate: () => void; // Action to trigger rehydration check
}

export const useAuthStore = create<AuthState>()(
  // Persist state to localStorage
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true, // Start loading on init to check persisted state

      login: (token, user) => {
        set({
          token,
          user,
          isAuthenticated: true,
          isAdmin: user.role === 'ADMIN',
          isLoading: false,
        });
        // No need to call localStorage directly, 'persist' handles it
      },

      logout: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          isAdmin: false,
          isLoading: false,
        });
         // No need to call localStorage directly, 'persist' handles it
        // Optionally disconnect socket or perform other cleanup
         console.log('Logged out, state cleared.');
      },

      setUser: (user) => set((state) => ({
         user,
         isAdmin: user?.role === 'ADMIN',
         isAuthenticated: !!user && !!state.token // Ensure token still exists
      })),

      setToken: (token) => set((state) => ({
          token,
          isAuthenticated: !!token && !!state.user // Ensure user still exists
      })),

      setLoading: (loading) => set({ isLoading: loading }),

      hydrate: () => {
          // This action can be called after the app mounts to finalize loading state
          // The `persist` middleware handles the actual loading from storage.
          // We just need to set isLoading to false once we know hydration is done.
          set({ isLoading: false });
           console.log('Auth store hydration checked, loading finished.');
      }
    }),
    {
      name: 'auth-storage', // Unique name for storage
      storage: createJSONStorage(() => localStorage), // Or sessionStorage
      // onRehydrateStorage: () => (state) => { // Might not be needed if using hydrate action
      //   state?.setLoading(false);
      // }
    }
  )
);

// Call hydrate after initial mount (e.g., in App.tsx useEffect)
// useAuthStore.getState().hydrate(); // Initial check