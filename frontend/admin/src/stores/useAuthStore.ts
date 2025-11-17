import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';

export interface Permission {
  name: string;
  description: string;
}

export interface Role {
  name: string;
  description: string;
  permissions: Permission[];
}

interface User {
  id: string;
  email: string;
  username: string;
  accountId?: string;
  accountType?: string;
  firstName?: string;
  lastName?: string;
  staffId?: string;
  cinemaId?: string | null;
  jobTitle?: string | null;
  avatarUrl?: string | null;
  roles?: Role[];
}

interface AuthState {
  // State
  token: string | null;
  user: User | null;
  isAuthenticated: boolean;
  permissions: Permission[];
  
  // Actions
  setAuth: (token: string, user: User) => void;
  clearAuth: () => void;
  updateUser: (user: Partial<User>) => void;
  setPermissions: (permissions: Permission[]) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      // Initial state
      token: null,
      user: null,
      isAuthenticated: false,
      permissions: [],
      
      // Actions
      setAuth: (token, user) => {
        // Extract all permissions from all roles
        const allPermissions = user.roles?.flatMap(role => role.permissions) || [];
        set({
          token,
          user,
          isAuthenticated: true,
          permissions: allPermissions,
        });
      },
      
      clearAuth: () => {
        set({
          token: null,
          user: null,
          isAuthenticated: false,
          permissions: [],
        });
      },
      
      updateUser: (userData) => {
        const currentUser = get().user;
        if (currentUser) {
          const updatedUser = { ...currentUser, ...userData };
          // Re-extract permissions if roles are updated
          const allPermissions = updatedUser.roles?.flatMap(role => role.permissions) || [];
          set({
            user: updatedUser,
            permissions: allPermissions,
          });
        }
      },

      setPermissions: (permissions) => {
        set({ permissions });
      },
    }),
    {
      name: 'auth-storage',
      storage: createJSONStorage(() => localStorage),
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        permissions: state.permissions,
      }),
    }
  )
);

// Selectors for optimized re-renders
export const selectIsAuthenticated = (state: AuthState) => state.isAuthenticated;
export const selectUser = (state: AuthState) => state.user;
export const selectToken = (state: AuthState) => state.token;
export const selectPermissions = (state: AuthState) => state.permissions;
export const selectRoles = (state: AuthState) => state.user?.roles || [];
