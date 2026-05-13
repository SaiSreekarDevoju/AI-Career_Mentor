import type { StateStorage } from "zustand/middleware";

const AUTH_KEY = "auth-storage";
const SCOPE_KEY = "mentoria-auth-scope";

export type AuthScope = "session" | "persist";

export function getAuthScope(): AuthScope {
  if (typeof window === "undefined") return "persist";
  const v = localStorage.getItem(SCOPE_KEY);
  return v === "session" ? "session" : "persist";
}

export function setAuthScope(scope: AuthScope) {
  localStorage.setItem(SCOPE_KEY, scope);
}

export const authPersistStorage: StateStorage = {
  getItem: (name) => {
    if (name !== AUTH_KEY) return localStorage.getItem(name);
    return getAuthScope() === "session"
      ? sessionStorage.getItem(name)
      : localStorage.getItem(name);
  },
  setItem: (name, value) => {
    if (name !== AUTH_KEY) {
      localStorage.setItem(name, value);
      return;
    }
    if (getAuthScope() === "session") {
      sessionStorage.setItem(name, value);
      try {
        localStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    } else {
      localStorage.setItem(name, value);
      try {
        sessionStorage.removeItem(name);
      } catch {
        /* ignore */
      }
    }
  },
  removeItem: (name) => {
    localStorage.removeItem(name);
    sessionStorage.removeItem(name);
  },
};

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export async function refreshAccessToken(refreshToken: string) {
  const res = await fetch(`${API}/auth/refresh`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });
  if (!res.ok) throw new Error("refresh_failed");
  return res.json() as Promise<{
    access_token: string;
    refresh_token: string;
    expires_in: number;
  }>;
}
