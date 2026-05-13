"use client";

import { Map, RefreshCw, Trophy, CheckCircle2, Circle, CalendarDays } from "lucide-react";
import { motion } from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function Roadmap() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const [data, setData] = useState<any>(null);
  const [roadmapId, setRoadmapId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const saveTimer = useRef<number | null>(null);

  const targetRole = user?.target_role || "Senior Frontend Engineer";

  const persist = useCallback(
    async (next: any, id: number | null) => {
      if (!token || !id) return;
      window.clearTimeout(saveTimer.current || 0);
      saveTimer.current = window.setTimeout(async () => {
        await fetch(`${API}/dashboard/roadmap/${id}`, {
          method: "PUT",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ weeks_data: next }),
        });
      }, 400);
    },
    [token]
  );

  const fetchRoadmap = useCallback(async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const res = await fetch(`${API}/dashboard/roadmap/generate`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ target_role: targetRole, missing_skills: ["System Design", "GraphQL", "AWS"] }),
      });
      const payload = await res.json();
      if (!payload.weeks) throw new Error("bad");
      const { id, ...rest } = payload;
      setRoadmapId(typeof id === "number" ? id : null);
      setData(rest);
    } catch {
      // handled by empty UI
    } finally {
      setIsLoading(false);
    }
  }, [token, targetRole]);

  const seeded = useRef(false);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`${API}/dashboard/roadmap/current`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        const cur = await res.json();
        if (cancelled) return;
        if (cur.weeks && cur.weeks.length) {
          setRoadmapId(cur.id);
          const { id, ...rest } = cur;
          setData(rest);
        } else if (!seeded.current) {
          seeded.current = true;
          const genRes = await fetch(`${API}/dashboard/roadmap/generate`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Bearer ${token}`,
            },
            body: JSON.stringify({
              target_role: targetRole,
              missing_skills: ["System Design", "GraphQL", "AWS"],
            }),
          });
          const payload = await genRes.json();
          if (!cancelled && payload.weeks) {
            const { id, ...rest } = payload;
            setRoadmapId(typeof id === "number" ? id : null);
            setData(rest);
          }
        }
      } finally {
        if (!cancelled) setIsLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token, targetRole]);

  const toggleTask = (weekIdx: number, taskIdx: number) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data));
    const t = updated.weeks[weekIdx].tasks[taskIdx];
    t.done = !t.done;
    setData(updated);
    void persist(updated, roadmapId);
  };

  const toggleDaily = (idx: number) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data));
    if (!updated.daily_tasks) updated.daily_tasks = [];
    updated.daily_tasks[idx].done = !updated.daily_tasks[idx].done;
    setData(updated);
    void persist(updated, roadmapId);
  };

  const updateGoalProgress = (idx: number, progress: number) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data));
    if (!updated.goals) updated.goals = [];
    updated.goals[idx].progress = Math.max(0, Math.min(100, progress));
    setData(updated);
    void persist(updated, roadmapId);
  };

  const updateGoalTitle = (idx: number, title: string) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data));
    if (!updated.goals) updated.goals = [];
    updated.goals[idx].title = title;
    setData(updated);
    void persist(updated, roadmapId);
  };

  const toggleMilestone = (idx: number) => {
    if (!data) return;
    const updated = JSON.parse(JSON.stringify(data));
    if (!updated.milestones) updated.milestones = [];
    updated.milestones[idx].done = !updated.milestones[idx].done;
    setData(updated);
    void persist(updated, roadmapId);
  };

  const { totalTasks, doneTasks, progress } = useMemo(() => {
    if (!data?.weeks) return { totalTasks: 0, doneTasks: 0, progress: 0 };
    let total = 0;
    let done = 0;
    for (const w of data.weeks) {
      for (const t of w.tasks || []) {
        total += 1;
        if (t.done) done += 1;
      }
    }
    for (const t of data.daily_tasks || []) {
      total += 1;
      if (t.done) done += 1;
    }
    for (const m of data.milestones || []) {
      total += 1;
      if (m.done) done += 1;
    }
    const p = total > 0 ? Math.round((done / total) * 100) : 0;
    return { totalTasks: total, doneTasks: done, progress: p };
  }, [data]);

  if (!data)
    return (
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="h-12 w-64 bg-white/10 rounded-xl animate-pulse" />
        <div className="glass-panel p-8 rounded-2xl space-y-8">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-32 bg-white/5 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Map className="text-emerald-400 w-8 h-8" />
            Roadmap
          </h1>
          <p className="text-secondary-foreground mt-1">Skill-based plan with daily tasks, milestones, and saved progress.</p>
        </div>
        <button
          onClick={() => void fetchRoadmap()}
          disabled={isLoading}
          className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors text-sm flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${isLoading ? "animate-spin" : ""}`} /> Regenerate
        </button>
      </div>

      <div className="glass-panel p-6 rounded-2xl">
        <div className="flex justify-between items-center mb-3">
          <div className="flex items-center gap-2">
            <Trophy className="w-5 h-5 text-amber-400" />
            <span className="font-bold">Overall Progress</span>
          </div>
          <span className="text-sm font-bold text-emerald-400">
            {doneTasks}/{totalTasks} items • {progress}%
          </span>
        </div>
        <div className="h-3 w-full bg-white/10 rounded-full overflow-hidden">
          <motion.div
            className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${progress}%` }}
            transition={{ duration: 0.8 }}
          />
        </div>
      </div>

      {Array.isArray(data.goals) && data.goals.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-4">
          <h3 className="font-bold flex items-center gap-2">
            <CalendarDays className="w-5 h-5 text-primary" /> Goals (editable)
          </h3>
          <div className="space-y-4">
            {data.goals.map((g: any, idx: number) => (
              <div key={g.id || idx} className="p-4 rounded-xl bg-white/5 border border-white/5 space-y-2">
                <input
                  value={g.title}
                  onChange={(e) => updateGoalTitle(idx, e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg px-3 py-2 text-white"
                />
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={0}
                    max={100}
                    value={Number(g.progress || 0)}
                    onChange={(e) => updateGoalProgress(idx, Number(e.target.value))}
                  />
                  <span className="text-sm text-secondary-foreground w-12 text-right">{Number(g.progress || 0)}%</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.daily_tasks) && data.daily_tasks.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <h3 className="font-bold">Daily tasks</h3>
          <div className="grid md:grid-cols-2 gap-3">
            {data.daily_tasks.map((t: any, idx: number) => (
              <button
                key={t.id || idx}
                onClick={() => toggleDaily(idx)}
                className={`text-left p-4 rounded-xl border transition-colors ${
                  t.done ? "border-emerald-400/40 bg-emerald-500/5" : "border-white/10 bg-black/30"
                }`}
              >
                <div className="text-xs text-secondary-foreground mb-1">Day {t.day ?? idx + 1}</div>
                <div className={`font-medium ${t.done ? "line-through text-secondary-foreground" : "text-white"}`}>{t.name}</div>
              </button>
            ))}
          </div>
        </div>
      )}

      {Array.isArray(data.milestones) && data.milestones.length > 0 && (
        <div className="glass-panel p-6 rounded-2xl space-y-3">
          <h3 className="font-bold">Weekly milestones</h3>
          <div className="space-y-2">
            {data.milestones.map((m: any, idx: number) => (
              <button
                key={m.id || idx}
                onClick={() => toggleMilestone(idx)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border ${
                  m.done ? "border-emerald-400/40 bg-emerald-500/5" : "border-white/10 bg-black/30"
                }`}
              >
                <div className="text-left">
                  <div className="font-bold">{m.title}</div>
                  <div className="text-xs text-secondary-foreground">Week {m.week}</div>
                </div>
                {m.done ? <CheckCircle2 className="text-emerald-400" /> : <Circle className="text-secondary-foreground" />}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="glass-panel p-8 rounded-2xl relative">
        <div className="absolute top-0 left-8 w-0.5 h-full bg-white/10 hidden md:block" />
        <div className="space-y-12">
          {data.weeks.map((week: any, idx: number) => {
            const weekDone = week.tasks.filter((t: any) => t.done).length;
            const weekTotal = week.tasks.length;
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: idx * 0.1 }}
                className="relative pl-0 md:pl-12"
              >
                <div
                  className={`absolute left-[-5px] top-1 w-3 h-3 rounded-full shadow-[0_0_10px] hidden md:block ${
                    weekDone === weekTotal ? "bg-emerald-400 shadow-emerald-400/80" : "bg-white/50 shadow-white/30"
                  }`}
                />

                <div className="flex items-center gap-3 mb-4">
                  <span className="px-3 py-1 bg-emerald-400/20 text-emerald-400 text-xs font-bold uppercase tracking-widest rounded-lg">
                    {week.week}
                  </span>
                  <h3 className="text-xl font-bold">{week.title}</h3>
                  <span className="text-xs text-secondary-foreground ml-auto">
                    {weekDone}/{weekTotal}
                  </span>
                </div>

                <div className="space-y-3">
                  {week.tasks.map((task: any, tIdx: number) => (
                    <div
                      key={task.id || `${idx}-${tIdx}`}
                      onClick={() => toggleTask(idx, tIdx)}
                      className={`flex items-center gap-4 p-4 rounded-xl border transition-all cursor-pointer ${
                        task.done ? "bg-white/5 border-emerald-400/30" : "bg-black/30 border-white/5 hover:border-white/20"
                      }`}
                    >
                      {task.done ? (
                        <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
                      ) : (
                        <Circle className="w-5 h-5 text-secondary-foreground shrink-0" />
                      )}
                      <div className="flex-1">
                        <div className={`font-medium ${task.done ? "text-secondary-foreground line-through" : "text-white"}`}>{task.name}</div>
                        {Array.isArray(task.skill_tags) && task.skill_tags.length > 0 && (
                          <div className="text-xs text-secondary-foreground mt-1">Skills: {task.skill_tags.join(", ")}</div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
