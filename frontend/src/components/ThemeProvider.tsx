"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useAuthStore } from "@/store/authStore";

type Theme = "dark" | "light";

const ThemeContext = createContext<{
  theme: Theme;
  setTheme: (t: Theme) => void;
} | null>(null);

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function applyHtmlTheme(t: Theme) {
  const root = document.documentElement;
  root.dataset.theme = t;
  root.classList.remove("light", "dark");
  root.classList.add(t === "light" ? "light" : "dark");
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const user = useAuthStore((s) => s.user);
  const token = useAuthStore((s) => s.token);
  const setUser = useAuthStore((s) => s.setUser);

  const [theme, setThemeState] = useState<Theme>("dark");

  useEffect(() => {
    const stored = (typeof window !== "undefined" && localStorage.getItem("mentoria-theme")) as Theme | null;
    const fromUser = (user?.theme as Theme | undefined) || null;
    const initial = fromUser || stored || "dark";
    const resolved = initial === "light" ? "light" : "dark";
    setThemeState(resolved);
    applyHtmlTheme(resolved);
  }, [user?.theme]);

  const setTheme = useCallback(
    async (t: Theme) => {
      const resolved = t === "light" ? "light" : "dark";
      setThemeState(resolved);
      applyHtmlTheme(resolved);
      try {
        localStorage.setItem("mentoria-theme", resolved);
      } catch {
        /* ignore */
      }
      if (token) {
        try {
          const res = await fetch(`${API}/auth/me`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({ theme: resolved }),
          });
          if (res.ok) setUser(await res.json());
        } catch {
          /* offline */
        }
      }
    },
    [token, setUser]
  );

  useEffect(() => {
    applyHtmlTheme(theme);
  }, [theme]);

  const value = useMemo(() => ({ theme, setTheme }), [theme, setTheme]);
  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) throw new Error("useTheme must be used within ThemeProvider");
  return ctx;
}
