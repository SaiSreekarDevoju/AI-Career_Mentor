"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { UserCircle, Briefcase, ExternalLink, IndianRupee } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function formatINR(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function ProfilePage() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [saved, setSaved] = useState<any[]>([]);
  const [applied, setApplied] = useState<any[]>([]);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/jobs/my-list`, { headers: { Authorization: `Bearer ${token}` } })
      .then((r) => r.json())
      .then((d) => {
        setSaved(d.saved || []);
        setApplied(d.applied || []);
      })
      .catch(() => {});
  }, [token]);

  const initials = useMemo(() => {
    const a = user?.first_name?.[0] || "";
    const b = user?.last_name?.[0] || "";
    return (a + b || "U").toUpperCase();
  }, [user]);

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex items-start gap-6">
        <div className="w-20 h-20 rounded-full bg-gradient-to-tr from-primary to-accent p-[2px]">
          <div className="w-full h-full bg-black rounded-full overflow-hidden flex items-center justify-center text-xl font-black">
            {user?.avatar_url ? <img src={user.avatar_url} alt="" className="w-full h-full object-cover" /> : initials}
          </div>
        </div>
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <UserCircle className="text-primary w-8 h-8" />
            Profile
          </h1>
          <p className="text-secondary-foreground mt-1">
            {user?.first_name} {user?.last_name} · {user?.email}
          </p>
          <p className="text-sm text-secondary-foreground mt-2">
            Target role: <span className="text-white font-medium">{user?.target_role || "—"}</span>
          </p>
        </div>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Briefcase className="w-5 h-5 text-primary" /> Saved Jobs
          </h2>
          <Link href="/dashboard/jobs" className="text-sm text-primary hover:underline">
            Browse jobs
          </Link>
        </div>
        {saved.length === 0 ? (
          <p className="text-secondary-foreground text-sm">No saved jobs yet.</p>
        ) : (
          <div className="space-y-3">
            {saved.map((j) => (
              <div key={`${j.id}-saved`} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold">{j.title}</div>
                  <div className="text-sm text-secondary-foreground">{j.company}</div>
                  <div className="text-xs text-secondary-foreground mt-1 flex items-center gap-2">
                    <IndianRupee className="w-3 h-3" />
                    {formatINR(j.salary_min_inr)} – {formatINR(j.salary_max_inr)}
                  </div>
                </div>
                <a
                  href={j.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-primary text-white text-sm font-bold flex items-center gap-2"
                >
                  Open <ExternalLink className="w-4 h-4" />
                </a>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2">
          <Briefcase className="w-5 h-5 text-accent" /> Applied Jobs
        </h2>
        {applied.length === 0 ? (
          <p className="text-secondary-foreground text-sm">No applications tracked yet.</p>
        ) : (
          <div className="space-y-3">
            {applied.map((j) => (
              <div key={`${j.id}-applied`} className="flex items-center justify-between p-4 rounded-xl bg-white/5 border border-white/5">
                <div>
                  <div className="font-bold">{j.title}</div>
                  <div className="text-sm text-secondary-foreground">{j.company}</div>
                  <div className="text-xs text-secondary-foreground mt-1">Applied: {j.applied_at ? new Date(j.applied_at).toLocaleString() : "—"}</div>
                </div>
                <a
                  href={j.apply_url}
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 rounded-lg bg-white/10 hover:bg-white/15 text-sm font-bold"
                >
                  View posting
                </a>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
