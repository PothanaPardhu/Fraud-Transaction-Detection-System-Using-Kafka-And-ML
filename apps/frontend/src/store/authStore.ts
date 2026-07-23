// apps/frontend/src/store/authStore.ts
import { create } from "zustand";
import { UserRole } from "@/types";

interface AuthState {
  isAuthenticated: boolean;
  user: {
    name: string;
    email: string;
    role: UserRole;
  } | null;
  login: (email: string, role: UserRole) => void;
  logout: () => void;
  setRole: (role: UserRole) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  isAuthenticated: true, // Default to true for dev preview
  user: {
    name: "Pothana Pardhu",
    email: "pardhu@fraudshield.ai",
    role: "SUPER_ADMIN",
  },
  login: (email, role) =>
    set({
      isAuthenticated: true,
      user: { name: email.split("@")[0], email, role },
    }),
  logout: () => set({ isAuthenticated: false, user: null }),
  setRole: (role) =>
    set((state) => ({
      user: state.user ? { ...state.user, role } : null,
    })),
}));