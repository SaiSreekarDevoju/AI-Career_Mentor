"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { isTrialExpired } from "@/lib/trial";

function pathAllowedWhenTrialExpired(pathname: string) {
  if (pathname === "/") return true;
  if (pathname === "/login" || pathname.startsWith("/login/")) return true;
  if (pathname === "/register" || pathname.startsWith("/register/")) return true;
  return false;
}

/**
 * When a trial has ended, only the marketing home (pricing preview), login, and register routes stay reachable.
 */
export function ExpiredTrialGate({ children }: { children: React.ReactNode }) {
  const pathname = usePathname() || "";
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const router = useRouter();
  const expired = Boolean(token && user && isTrialExpired(user));

  useEffect(() => {
    if (!expired) return;
    if (pathAllowedWhenTrialExpired(pathname)) return;
    router.replace("/");
  }, [expired, pathname, router]);

  if (expired && !pathAllowedWhenTrialExpired(pathname)) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center px-6">
        <p className="text-sm">Opening plans…</p>
      </div>
    );
  }

  return <>{children}</>;
}
