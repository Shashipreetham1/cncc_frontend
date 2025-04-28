// src/store/authStore.ts
import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

// Define Role enum/type (matches backend and type files)
export type Role = 'ADMIN' | 'USER';

// User object stored in state
export interface User {
  id: string;
  username: string;
  role: Role;
}

// Zustand store interface
interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isLoading: boolean; // Important for initial load check

  login: (token: string, user: User) => void;
  logout: () => void;
  setUser: (user: User | null) => void; // Potentially needed for profile updates
  setToken: (token: string | null) => void; // Maybe used for token refresh?
  setLoading: (loading: boolean) => void;
  hydrate: () => void; // Called by App.tsx
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      user: null,
      token: null,
      isAuthenticated: false,
      isAdmin: false,
      isLoading: true, // Start as loading

      // Actions
      login: (token, user) => {
        set({ token, user, isAuthenticated: true, isAdmin: user.role === 'ADMIN', isLoading: false });
      },
      logout: () => {
        set({ token: null, user: null, isAuthenticated: false, isAdmin: false, isLoading: false });
        console.log("Auth state cleared on logout.");
      },
      setUser: (user) => set((state) => ({ user, isAdmin: user?.role === 'ADMIN', isAuthenticated: !!user && !!state.token })),
      setToken: (token) => set((state) => ({ token, isAuthenticated: !!token && !!state.user })),
      setLoading: (loading) => set({ isLoading: loading }),
      hydrate: () => { set({ isLoading: false }); /* console.log("Auth hydrated, isLoading set to false.")*/ }
    }),
    {
      // Persistence config
      name: 'cncc-auth-storage', // localStorage key
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({ user: state.user, token: state.token }), // Only persist user and token
      onRehydrateStorage: () => (state, error) => { // Recalculate derived state after loading
          if (error) {
             console.error("Failed to rehydrate auth state:", error);
              state?.logout(); // Force clear state on error
          } else if (state) {
              state.isAuthenticated = !!state.token && !!state.user;
              state.isAdmin = state.user?.role === 'ADMIN';
               // isLoading is handled by the hydrate() action call now
          }
      },
    }
  )
);