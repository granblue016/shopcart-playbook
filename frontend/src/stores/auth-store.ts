import { create } from "zustand";
import { persist } from "zustand/middleware";
import { TOKEN_KEY, USER_KEY, clearToken } from "@/lib/api";
import type { User } from "@/lib/types";

interface AuthState {
  token: string | null;
  user: User | null;
  setAuth: (token: string, user: User) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      setAuth: (token, user) => {
        // Mirror to known keys so any consumer (and tests) can read them.
        localStorage.setItem(TOKEN_KEY, token);
        localStorage.setItem(USER_KEY, JSON.stringify(user));
        set({ token, user });
      },
      logout: () => {
        clearToken();
        set({ token: null, user: null });
      },
    }),
    { name: "shopcart-auth" },
  ),
);
