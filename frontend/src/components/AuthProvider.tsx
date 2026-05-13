"use client";

import { useEffect, useRef } from "react";
import { useAuthStore } from "@/store/authStore";
import { refreshAccessToken } from "@/lib/authStorage";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

async function fetchMe(access: string) {
  const res = await fetch(`${API}/auth/me`, {
    headers: { Authorization: `Bearer ${access}` },
  });
  if (!res.ok) throw new Error("me_failed");
  return res.json();
}

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const token = useAuthStore((s) => s.token);
  const refreshToken = useAuthStore((s) => s.refreshToken);
  const setToken = useAuthStore((s) => s.setToken);
  const setRefreshToken = useAuthStore((s) => s.setRefreshToken);
  const setUser = useAuthStore((s) => s.setUser);
  const logout = useAuthStore((s) => s.logout);
  const lastUserSync = useRef<string | null>(null);

  useEffect(() => {
    if (!token && !refreshToken) return;

    const syncKey = `${token || ""}|${refreshToken || ""}`;
    if (lastUserSync.current === syncKey) return;
    lastUserSync.current = syncKey;

    const bootstrap = async () => {
      try {
        let access = token;
        if (!access && refreshToken) {
          const data = await refreshAccessToken(refreshToken);
          access = data.access_token;
          setToken(data.access_token);
          setRefreshToken(data.refresh_token);
        }
        if (!access) {
          logout();
          return;
        }
        try {
          setUser(await fetchMe(access));
        } catch {
          if (refreshToken) {
            const data = await refreshAccessToken(refreshToken);
            setToken(data.access_token);
            setRefreshToken(data.refresh_token);
            setUser(await fetchMe(data.access_token));
          } else {
            logout();
          }
        }
      } catch {
        logout();
      }
    };

    void bootstrap();
  }, [token, refreshToken, logout, setRefreshToken, setToken, setUser]);

  return <>{children}</>;
}
