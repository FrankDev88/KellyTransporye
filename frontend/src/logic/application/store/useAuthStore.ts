import { create } from "zustand";
import type { User } from "../../domain/models/User";

interface AuthState {
  user: User["props"] | null;
  isAuthenticated: boolean;
  setUser: (user: User["props"] | null) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  isAuthenticated: false,
  setUser: (user) => set({ user, isAuthenticated: !!user }),
  logout: () => {
    localStorage.removeItem("auth_token");
    set({ user: null, isAuthenticated: false });
  },
}));
