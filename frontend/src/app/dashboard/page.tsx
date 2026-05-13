"use client";

import { motion } from "framer-motion";
import {
  TrendingUp,
  Target,
  Briefcase,
  Award,
  ChevronRight,
  Sparkles,
  Zap,
  FileText,
} from "lucide-react";
import Link from "next/link";
import { useEffect, useState } from "react";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function DashboardOverview() {
  const [data, setData] = useState<any>(null);
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!token) return;
    fetch(`${API}/dashboard/overview`, {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((res) => res.json())
      .then((d) => {
        if (typeof d.ats_score !== "number") throw new Error("Invalid API Response");
        setData(d);
      })
      .catch(() => {
        setData({
          ats_score: 0,
          jobs_matched: 0,
          skills_learned: 0,
          interview_readiness: 0,
          recommended_actions: [
            {
              title: "Upload your resume",
              desc: "Kick off ATS scoring and tailored recommendations.",
              time: "5 mins",
              link: "/dashboard/resume",
            },
            {
              title: "Try a mock interview",
              desc: "Calibrate your readiness with a scored session.",
              time: "25 mins",
              link: "/dashboard/interviews",
            },
          ],
          goals: [{ title: "Interview readiness", progress: 0, color: "bg-primary" }],
        });
      });
  }, [token]);

  if (!data)
    return (
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="h-40 glass-panel rounded-2xl animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 glass-panel rounded-2xl animate-pulse" />
          ))}
        </div>
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 h-60 glass-panel rounded-2xl animate-pulse" />
          <div className="h-60 glass-panel rounded-2xl animate-pulse" />
        </div>
      </div>
    );

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="w-full glass-panel p-8 rounded-2xl relative overflow-hidden flex flex-col md:flex-row justify-between items-center border border-primary/20"
      >
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-[80px]" />

        <div className="relative z-10 space-y-2">
          <h2 className="text-2xl md:text-3xl font-bold flex items-center gap-2">
            Welcome back, {user?.first_name || "there"}! <span className="animate-wave inline-block">👋</span>
          </h2>
          <p className="text-secondary-foreground">
            Your dashboard updates live from your latest resume, roadmap progress, and interview sessions.
          </p>
        </div>

        <Link
          href="/dashboard/roadmap"
          className="relative z-10 mt-6 md:mt-0 px-6 py-3 bg-white text-black rounded-full font-semibold flex items-center gap-2 hover:scale-105 transition-transform"
        >
          <Sparkles className="w-4 h-4" />
          Open Roadmap
        </Link>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="ATS Score" value={`${data.ats_score}/100`} trend="Live" icon={FileText} color="text-emerald-400" href="/dashboard/resume" />
        <StatCard title="Jobs Matched" value={data.jobs_matched} trend="DB" icon={Briefcase} color="text-primary" href="/dashboard/jobs" />
        <StatCard title="Skills Progress" value={data.skills_learned} trend="Tasks" icon={Target} color="text-accent" href="/dashboard/roadmap" />
        <StatCard
          title="Interview Readiness"
          value={`${data.interview_readiness}%`}
          trend="Avg"
          icon={Award}
          color="text-amber-400"
          href="/dashboard/interviews"
        />
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="lg:col-span-2 glass-panel p-6 rounded-2xl space-y-6"
        >
          <div className="flex justify-between items-center">
            <h3 className="text-lg font-bold flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Recommended next steps
            </h3>
            <Link href="/dashboard/roadmap" className="text-sm text-primary hover:underline">
              View roadmap
            </Link>
          </div>

          <div className="space-y-4">
            {data.recommended_actions.map((action: any, i: number) => (
              <Link
                key={i}
                href={action.link || "/dashboard"}
                className="p-4 rounded-xl bg-white/5 border border-white/5 hover:border-white/20 transition-colors flex justify-between items-center cursor-pointer group block"
              >
                <div>
                  <h4 className="font-semibold text-white mb-1 group-hover:text-primary transition-colors">{action.title}</h4>
                  <p className="text-sm text-secondary-foreground">{action.desc}</p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="text-xs font-medium text-secondary-foreground bg-black/50 px-2 py-1 rounded">{action.time}</span>
                  <ChevronRight className="w-5 h-5 text-secondary-foreground group-hover:text-white transition-colors" />
                </div>
              </Link>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-panel p-6 rounded-2xl space-y-6"
        >
          <h3 className="text-lg font-bold flex items-center gap-2">
            <Target className="w-5 h-5 text-accent" />
            Goals
          </h3>

          <div className="space-y-6">
            {data.goals.map((goal: any, i: number) => (
              <ProgressItem key={i} title={goal.title} progress={goal.progress} color={goal.color} />
            ))}
          </div>

          <Link
            href="/dashboard/roadmap"
            className="w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 transition-colors text-sm font-medium flex justify-center items-center gap-2 block text-center"
          >
            Update goals
          </Link>
        </motion.div>
      </div>
    </div>
  );
}

function StatCard({ title, value, trend, icon: Icon, color, href }: any) {
  return (
    <Link href={href}>
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="glass-panel p-6 rounded-2xl relative overflow-hidden group cursor-pointer hover:border-primary/30 transition-colors"
      >
        <div className="flex justify-between items-start mb-4">
          <div className={`p-3 rounded-xl bg-white/5 ${color} group-hover:scale-110 transition-transform`}>
            <Icon className="w-6 h-6" />
          </div>
          <div className="flex items-center gap-1 text-emerald-400 text-sm font-medium bg-emerald-400/10 px-2 py-1 rounded-full">
            <TrendingUp className="w-3 h-3" />
            {trend}
          </div>
        </div>
        <div>
          <div className="text-secondary-foreground text-sm font-medium mb-1">{title}</div>
          <div className="text-3xl font-bold">{value}</div>
        </div>
      </motion.div>
    </Link>
  );
}

function ProgressItem({ title, progress, color }: any) {
  return (
    <div className="space-y-2">
      <div className="flex justify-between text-sm">
        <span className="font-medium text-white">{title}</span>
        <span className="text-secondary-foreground">{progress}%</span>
      </div>
      <div className="h-2 w-full bg-white/10 rounded-full overflow-hidden">
        <motion.div
          className={`h-full ${color} rounded-full`}
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 1, ease: "easeOut" }}
        />
      </div>
    </div>
  );
}
