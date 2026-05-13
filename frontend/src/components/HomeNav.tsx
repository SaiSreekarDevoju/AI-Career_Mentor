"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { BrainCircuit, Bell, UserCircle, LogOut } from "lucide-react";
import { useAuthStore } from "@/store/authStore";
import { isTrialExpired } from "@/lib/trial";

export function HomeNav() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const logout = useAuthStore((s) => s.logout);
  const router = useRouter();
  const pricingOnly = Boolean(token && user && isTrialExpired(user));

  if (pricingOnly) {
    return (
      <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-10 border-b border-border">
        <Link href="/" className="flex items-center gap-2">
          <BrainCircuit className="text-primary w-8 h-8" />
          <span className="text-xl font-bold tracking-tight text-foreground">
            Mentoria<span className="text-primary">.ai</span>
          </span>
        </Link>
        <div className="flex items-center gap-3">
          <a
            href="#pricing"
            className="px-5 py-2.5 text-sm font-medium text-foreground border border-border rounded-full hover:bg-muted transition-colors"
          >
            View plans
          </a>
          <button
            type="button"
            onClick={() => {
              logout();
              router.push("/login");
            }}
            className="px-5 py-2.5 text-sm font-medium rounded-full border border-border text-muted-foreground hover:text-foreground hover:bg-muted transition-colors inline-flex items-center gap-2"
          >
            <LogOut className="w-4 h-4" />
            Log out
          </button>
        </div>
      </nav>
    );
  }

  return (
    <nav className="w-full max-w-7xl px-6 py-6 flex justify-between items-center z-10">
      <div className="flex items-center gap-2">
        <BrainCircuit className="text-primary w-8 h-8" />
        <span className="text-xl font-bold tracking-tight text-foreground">
          Mentoria<span className="text-primary">.ai</span>
        </span>
      </div>
      <div className="hidden md:flex gap-8 text-sm font-medium text-muted-foreground">
        <Link href="#features" className="hover:text-foreground transition-colors">
          Features
        </Link>
        <Link href="#how-it-works" className="hover:text-foreground transition-colors">
          How it works
        </Link>
        <Link href="#pricing" className="hover:text-foreground transition-colors">
          Pricing
        </Link>
      </div>
      <div className="flex items-center gap-3">
        {token && (
          <>
            <Link href="/dashboard" title="Dashboard" className="header-icon-btn" aria-label="Dashboard">
              <Bell className="w-5 h-5" />
            </Link>
            <Link href="/dashboard/profile" title="Profile" className="header-icon-btn" aria-label="Profile">
              <UserCircle className="w-5 h-5" />
            </Link>
          </>
        )}
        <Link href="/login" className="px-5 py-2.5 text-sm font-medium text-muted-foreground hover:text-foreground transition-colors">
          Login
        </Link>
        <Link
          href="/register"
          className="px-5 py-2.5 bg-primary text-primary-foreground text-sm font-medium rounded-full hover:bg-primary/90 transition-colors"
        >
          Get Started
        </Link>
      </div>
    </nav>
  );
}
