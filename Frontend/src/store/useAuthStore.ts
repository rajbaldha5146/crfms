import { create } from "zustand";
import { getMe } from "../api/authApi";

export interface User {
  id: number;
  name: string;
  email: string;
  role?: string;
  isFirstLogin: boolean;
}

interface AuthState {
  user: User | null;
  isAuthenticated: boolean;
  isInitializing: boolean;
  isRefreshing: boolean;
  login: (user: User) => void;
  logout: () => void;
  initialize: () => Promise<void>;
  setIsRefreshing: (value: boolean) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  isInitializing: true,
  isRefreshing: false,

  login: (user) => set({ user, isAuthenticated: true }),

  logout: () => set({ user: null, isAuthenticated: false, isRefreshing: false }),

  setIsRefreshing: (value) => set({ isRefreshing: value }),

  initialize: async () => {
    try {
      const response = await getMe();
      if (response.success && response.data) {
        set({ user: response.data, isAuthenticated: true });
      }
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      set({ user: null, isAuthenticated: false });
    } finally {
      set({ isInitializing: false });
    }
  },
}));