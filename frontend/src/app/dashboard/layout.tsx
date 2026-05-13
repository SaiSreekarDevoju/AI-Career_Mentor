"use client";

import { ReactNode, useEffect, useMemo, useRef, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { isTrialExpired } from "@/lib/trial";
import {
  LayoutDashboard,
  FileText,
  Target,
  Briefcase,
  Map,
  MessageSquare,
  Settings,
  LogOut,
  BrainCircuit,
  Bell,
  Home,
  UserCircle,
  CreditCard,
} from "lucide-react";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const navItems = [
  { name: "Overview", href: "/dashboard", icon: LayoutDashboard },
  { name: "Resume AI", href: "/dashboard/resume", icon: FileText },
  { name: "Skill Gap", href: "/dashboard/skills", icon: Target },
  { name: "Jobs Match", href: "/dashboard/jobs", icon: Briefcase },
  { name: "Roadmap", href: "/dashboard/roadmap", icon: Map },
  { name: "Mock Interviews", href: "/dashboard/interviews", icon: MessageSquare },
];

const bottomNavItems = [
  { name: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
  { name: "Settings", href: "/dashboard/settings", icon: Settings },
];

function formatCountdown(ms: number) {
  if (ms <= 0) return "00:00:00:00";
  const day = Math.floor(ms / 86400000);
  const hr = Math.floor((ms % 86400000) / 3600000);
  const mn = Math.floor((ms % 3600000) / 60000);
  const sc = Math.floor((ms % 60000) / 1000);
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${pad(day)}:${pad(hr)}:${pad(mn)}:${pad(sc)}`;
}

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifs, setShowNotifs] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);
  const profileRef = useRef<HTMLDivElement>(null);

  const { user, logout, token, refreshToken } = useAuthStore();
  const router = useRouter();

  const [serverSkewMs, setServerSkewMs] = useState(0);
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(id);
  }, []);

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/dashboard/trial`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        const server = new Date(d.server_time).getTime();
        setServerSkewMs(server - Date.now());
      })
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/dashboard/notifications`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((data) => setNotifications(data.notifications || []))
      .catch(() => {});
  }, [token, showNotifs]);

  const handleLogout = async () => {
    try {
      if (token && refreshToken) {
        await fetch(`${API}/auth/logout`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ refresh_token: refreshToken }),
        });
      }
    } catch {
      /* ignore */
    }
    logout();
    router.push("/login");
  };

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setShowNotifs(false);
      if (profileRef.current && !profileRef.current.contains(e.target as Node)) setShowProfileMenu(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const unreadCount = notifications.filter((n) => !n.is_read).length;

  const markAsRead = (id: number) => {
    if (!token) return;
    fetch(`${API}/dashboard/notifications/${id}/read`, {
      method: "PUT",
      headers: { Authorization: `Bearer ${token}` },
    }).then(() => {
      setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, is_read: true } : n)));
    });
  };

  const pageTitle = () => {
    const last = pathname?.split("/").pop();
    if (last === "dashboard") return "Overview";
    if (last === "pricing") return "Pricing";
    return last?.replace("-", " ").replace(/\b\w/g, (l) => l.toUpperCase()) || "Dashboard";
  };

  const isTrial = Boolean(user?.is_trial_user);
  const trialEnd = user?.trial_end_date ? new Date(user.trial_end_date) : null;
  const nowMs = Date.now() + serverSkewMs;
  const trialRemainingMs = trialEnd ? trialEnd.getTime() - nowMs : 0;
  const expired = Boolean(user && isTrialExpired(user, nowMs));

  useEffect(() => {
    if (!token || !user) return;
    if (!expired) return;
    router.replace("/");
  }, [token, user, expired, router]);

  const liveCountdown = useMemo(() => formatCountdown(trialRemainingMs), [trialRemainingMs, tick]);

  if (token && user && expired) {
    return (
      <div className="min-h-screen bg-background text-muted-foreground flex items-center justify-center px-6">
        <p className="text-sm">Opening plans…</p>
      </div>
    );
  }

  return (
    <div className="dashboard-root min-h-screen bg-background text-foreground flex">
      <aside className="surface-sidebar w-64 border-r border-border flex flex-col fixed h-full z-20 shadow-sm">
        <div className="p-6 flex items-center gap-2 border-b border-border">
          <BrainCircuit className="text-primary w-6 h-6" />
          <span className="text-lg font-bold tracking-tight text-foreground">
            Mentoria<span className="text-primary">.ai</span>
          </span>
        </div>

        <div className="flex-1 overflow-y-auto py-6 px-4 flex flex-col gap-2">
          <div className="text-xs font-semibold text-muted-foreground mb-2 px-2 uppercase tracking-wider">Menu</div>
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}

          <Link
            href="/dashboard/profile"
            className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
              pathname === "/dashboard/profile"
                ? "bg-primary/15 text-primary border border-primary/25 shadow-sm"
                : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
            }`}
          >
            <UserCircle className="w-5 h-5" />
            <span className="font-medium text-sm">Profile</span>
          </Link>
        </div>

        <div className="p-4 border-t border-border flex flex-col gap-2">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            return (
              <Link
                key={item.name}
                href={item.href}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all ${
                  isActive
                    ? "bg-primary/15 text-primary border border-primary/25"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground border border-transparent"
                }`}
              >
                <Icon className="w-5 h-5" />
                <span className="font-medium text-sm">{item.name}</span>
              </Link>
            );
          })}
          <button
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-red-500 hover:bg-red-500/10 transition-all w-full text-left"
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium text-sm">Log out</span>
          </button>
        </div>
      </aside>

      <main className="flex-1 ml-64 flex flex-col min-h-screen relative bg-background">
        <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-primary/5 rounded-full blur-[150px] pointer-events-none" />

        <header className="surface-navbar h-16 border-b border-border flex items-center justify-between px-8 sticky top-0 z-40 shadow-sm">
          <h1 className="text-xl font-semibold text-foreground">{pageTitle()}</h1>

          <div className="flex items-center gap-3">
            <Link href="/dashboard" className="header-icon-btn" title="Home" aria-label="Home dashboard">
              <Home className="w-5 h-5" />
            </Link>

            <div className="relative" ref={notifRef}>
              <button
                type="button"
                onClick={() => setShowNotifs(!showNotifs)}
                className="header-icon-btn"
                data-active={showNotifs ? "true" : "false"}
                title="Notifications"
                aria-pressed={showNotifs}
              >
                <Bell className="w-5 h-5" />
                {unreadCount > 0 && (
                  <span className="absolute top-1.5 right-1.5 w-2.5 h-2.5 bg-red-500 rounded-full border-2 border-[var(--color-card)] animate-pulse" />
                )}
              </button>

              {showNotifs && (
                <div className="absolute right-0 top-12 w-80 rounded-2xl border border-border header-flyout-panel text-foreground overflow-hidden z-[100]">
                  <div className="p-4 border-b border-border flex justify-between items-center bg-card">
                    <h3 className="font-bold text-sm">Notifications</h3>
                    <span className="text-xs text-muted-foreground">{unreadCount} unread</span>
                  </div>
                  <div className="max-h-64 overflow-y-auto bg-card">
                    {notifications.length === 0 ? (
                      <div className="p-6 text-center text-muted-foreground text-sm">No notifications yet</div>
                    ) : (
                      notifications.map((n) => (
                        <div
                          key={n.id}
                          className={`p-4 border-b border-border hover:bg-muted transition-colors cursor-pointer flex gap-3 ${
                            !n.is_read ? "bg-primary/10" : "bg-card"
                          }`}
                          onClick={() => markAsRead(n.id)}
                        >
                          <div
                            className={`w-2 h-2 rounded-full mt-2 shrink-0 ${
                              n.is_read ? "bg-muted-foreground/40" : "bg-primary"
                            }`}
                          />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{n.title}</p>
                            <p className="text-xs text-muted-foreground truncate">{n.message}</p>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>

            <div className="relative" ref={profileRef}>
              <button
                type="button"
                onClick={() => setShowProfileMenu(!showProfileMenu)}
                className="header-icon-btn p-0 overflow-hidden ring-2 ring-transparent data-[active=true]:ring-primary/50"
                data-active={showProfileMenu ? "true" : "false"}
                aria-pressed={showProfileMenu}
                title="Profile menu"
              >
                <div className="w-full h-full rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
                  <div className="w-full h-full bg-card rounded-full overflow-hidden flex items-center justify-center text-sm font-bold text-foreground">
                    {user?.avatar_url ? (
                      <img src={user.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      (user?.first_name ? user.first_name[0] + (user.last_name?.[0] || "") : "U")
                    )}
                  </div>
                </div>
              </button>

              {showProfileMenu && (
                <div className="absolute right-0 top-12 w-56 rounded-2xl border border-border header-flyout-panel text-foreground overflow-hidden z-[100]">
                  <div className="p-4 border-b border-border bg-card">
                    <p className="font-bold text-sm">
                      {user?.first_name} {user?.last_name}
                    </p>
                    <p className="text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="py-2 bg-card">
                    {[
                      { label: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
                      { label: "Profile", href: "/dashboard/profile", icon: UserCircle },
                      { label: "Pricing", href: "/dashboard/pricing", icon: CreditCard },
                      { label: "My Resume", href: "/dashboard/resume", icon: FileText },
                      { label: "Skills", href: "/dashboard/skills", icon: Target },
                      { label: "Interviews", href: "/dashboard/interviews", icon: MessageSquare },
                      { label: "Settings", href: "/dashboard/settings", icon: Settings },
                    ].map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={() => setShowProfileMenu(false)}
                        className="flex items-center gap-3 px-4 py-2.5 text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                      >
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </Link>
                    ))}
                  </div>
                  <div className="border-t border-border py-2 bg-card">
                    <button
                      onClick={handleLogout}
                      className="flex items-center gap-3 px-4 py-2.5 text-sm text-red-500 hover:bg-red-500/10 transition-colors w-full text-left"
                    >
                      <LogOut className="w-4 h-4" />
                      Log out
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="p-8 flex-1 relative z-0 flex flex-col">
          {isTrial && !expired && (
            <div className="w-full bg-accent/15 border border-accent/40 text-foreground p-3 rounded-xl mb-6 flex items-center justify-between shadow-sm">
              <div className="flex items-center gap-3">
                <BrainCircuit className="w-5 h-5 text-accent" />
                <span className="font-semibold">Free Trial Ends In: {liveCountdown}</span>
              </div>
              <Link
                href="/dashboard/pricing"
                className="px-4 py-1.5 bg-accent text-accent-foreground text-sm font-bold rounded-lg hover:bg-accent/90 transition-colors"
              >
                Upgrade Now
              </Link>
            </div>
          )}

          <div className="relative flex-1">{children}</div>
        </div>
      </main>
    </div>
  );
}
