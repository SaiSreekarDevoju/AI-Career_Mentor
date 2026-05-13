import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import { authPersistStorage, setAuthScope, type AuthScope } from "@/lib/authStorage";

export interface User {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  avatar_url?: string;
  target_role?: string;
  is_trial_user?: boolean;
  trial_end_date?: string | null;
  subscription_type?: string;
  theme?: string;
}

interface AuthState {
  token: string | null;
  refreshToken: string | null;
  user: User | null;
  setToken: (token: string) => void;
  setRefreshToken: (t: string | null) => void;
  setUser: (user: User) => void;
  setAuthSession: (args: {
    token: string;
    refreshToken: string;
    user: User;
    rememberMe: boolean;
  }) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      token: null,
      refreshToken: null,
      user: null,
      setToken: (token) => set({ token }),
      setRefreshToken: (refreshToken) => set({ refreshToken }),
      setUser: (user) => set({ user }),
      setAuthSession: ({ token, refreshToken, user, rememberMe }) => {
        const scope: AuthScope = rememberMe ? "persist" : "session";
        setAuthScope(scope);
        set({ token, refreshToken, user });
      },
      logout: () => {
        set({ token: null, refreshToken: null, user: null });
        try {
          sessionStorage.removeItem("auth-storage");
          localStorage.removeItem("auth-storage");
        } catch {
          /* ignore */
        }
      },
    }),
    {
      name: "auth-storage",
      storage: createJSONStorage(() => authPersistStorage),
      partialize: (s) => ({
        token: s.token,
        refreshToken: s.refreshToken,
        user: s.user,
      }),
    }
  )
);
