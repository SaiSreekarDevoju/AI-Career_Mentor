"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { Briefcase, ExternalLink, MapPin, IndianRupee, Star, Filter, X } from "lucide-react";
import { motion } from "framer-motion";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

function formatINR(n?: number | null) {
  if (n == null) return "—";
  return new Intl.NumberFormat("en-IN", { style: "currency", currency: "INR", maximumFractionDigits: 0 }).format(n);
}

export default function JobRecommendations() {
  const token = useAuthStore((s) => s.token);
  const [jobs, setJobs] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [q, setQ] = useState("");

  const [locationType, setLocationType] = useState("Any");
  const [jobType, setJobType] = useState("Any");
  const [companyType, setCompanyType] = useState("Any");
  const [experienceLevel, setExperienceLevel] = useState("Any");
  const [skills, setSkills] = useState("");
  const [salaryMin, setSalaryMin] = useState<string>("");
  const [salaryMax, setSalaryMax] = useState<string>("");

  const queryString = useMemo(() => {
    const p = new URLSearchParams();
    if (locationType !== "Any") p.set("location_type", locationType);
    if (jobType !== "Any") p.set("job_type", jobType);
    if (companyType !== "Any") p.set("company_type", companyType);
    if (experienceLevel !== "Any") p.set("experience_level", experienceLevel);
    if (skills.trim()) p.set("skills", skills.trim());
    if (salaryMin) p.set("salary_min_inr", salaryMin);
    if (salaryMax) p.set("salary_max_inr", salaryMax);
    if (q.trim()) p.set("q", q.trim());
    return p.toString();
  }, [locationType, jobType, companyType, experienceLevel, skills, salaryMin, salaryMax, q]);

  const load = async () => {
    if (!token) return;
    setIsLoading(true);
    try {
      const url = `${API}/jobs/recommendations${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch {
      setJobs([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    void load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token, queryString]);

  const save = async (jobId: number) => {
    if (!token) return;
    await fetch(`${API}/jobs/${jobId}/save`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    void load();
  };

  const apply = async (jobId: number) => {
    if (!token) return;
    const res = await fetch(`${API}/jobs/${jobId}/apply`, {
      method: "POST",
      headers: { Authorization: `Bearer ${token}` },
    });
    const data = await res.json();
    void load();
    if (data.apply_url) window.open(data.apply_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <Briefcase className="text-primary w-8 h-8" />
            AI Job Match Engine
          </h1>
          <p className="text-secondary-foreground mt-1">Database-backed matches with filters and saved/applied tracking.</p>
        </div>
        <div className="flex gap-4">
          <button
            onClick={() => setFiltersOpen(true)}
            type="button"
            className="px-4 py-2 rounded-xl font-medium flex items-center gap-2 transition-colors border border-border bg-card text-foreground hover:bg-muted shadow-sm"
          >
            <Filter className="w-4 h-4" /> Filters
          </button>
        </div>
      </div>

      <div className="relative">
        <input
          type="text"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && void load()}
          placeholder="Search title, company, description..."
          className="w-full bg-input border border-border hover:border-ring/40 focus:border-primary rounded-2xl px-4 py-4 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 transition-colors"
        />
        <button
          type="button"
          onClick={() => void load()}
          className="absolute right-2 top-1/2 -translate-y-1/2 px-4 py-2 bg-primary text-primary-foreground rounded-xl font-medium hover:opacity-95 transition-opacity"
        >
          Search
        </button>
      </div>

      {filtersOpen && (
        <div className="fixed inset-0 z-[70] flex items-center justify-center p-4">
          <button
            type="button"
            className="absolute inset-0 bg-black/75 dark:bg-black/85"
            aria-label="Close filters"
            onClick={() => setFiltersOpen(false)}
          />
          <div className="relative w-full max-w-xl jobs-filters-panel z-10">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-foreground">Filters</h3>
              <button
                type="button"
                onClick={() => setFiltersOpen(false)}
                className="p-2 rounded-lg hover:bg-muted border border-transparent hover:border-border transition-colors text-foreground"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="grid md:grid-cols-2 gap-4">
              <label className="text-sm">
                Location
                <select
                  value={locationType}
                  onChange={(e) => setLocationType(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                >
                  {["Any", "Remote", "Hybrid", "On-site"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Job type
                <select
                  value={jobType}
                  onChange={(e) => setJobType(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                >
                  {["Any", "Internship", "Full-time"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Company type
                <select
                  value={companyType}
                  onChange={(e) => setCompanyType(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                >
                  {["Any", "Startup", "Enterprise"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm">
                Experience
                <select
                  value={experienceLevel}
                  onChange={(e) => setExperienceLevel(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                >
                  {["Any", "0-1 years", "1-3 years", "2-4 years", "2-5 years", "3-6 years", "6+ years"].map((x) => (
                    <option key={x} value={x}>
                      {x}
                    </option>
                  ))}
                </select>
              </label>
              <label className="text-sm md:col-span-2">
                Skills (comma-separated)
                <input
                  value={skills}
                  onChange={(e) => setSkills(e.target.value)}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                  placeholder="React, AWS, Python"
                />
              </label>
              <label className="text-sm">
                Min salary (INR / year)
                <input
                  value={salaryMin}
                  onChange={(e) => setSalaryMin(e.target.value.replace(/[^\d]/g, ""))}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                  placeholder="1200000"
                />
              </label>
              <label className="text-sm">
                Max salary (INR / year)
                <input
                  value={salaryMax}
                  onChange={(e) => setSalaryMax(e.target.value.replace(/[^\d]/g, ""))}
                  className="mt-1 w-full rounded-xl px-3 py-2.5"
                  placeholder="4000000"
                />
              </label>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                type="button"
                className="px-4 py-2.5 rounded-xl border border-border bg-muted text-foreground font-semibold hover:bg-muted/80 transition-colors"
                onClick={() => {
                  setLocationType("Any");
                  setJobType("Any");
                  setCompanyType("Any");
                  setExperienceLevel("Any");
                  setSkills("");
                  setSalaryMin("");
                  setSalaryMax("");
                }}
              >
                Reset
              </button>
              <button
                type="button"
                className="px-5 py-2.5 rounded-xl bg-primary text-primary-foreground font-bold shadow-md hover:bg-primary/90 transition-colors"
                onClick={() => setFiltersOpen(false)}
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="flex flex-col items-center justify-center py-20">
          <div className="w-8 h-8 border-4 border-primary/30 border-t-primary rounded-full animate-spin mb-4" />
          <p className="text-secondary-foreground">Loading jobs…</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {jobs.map((job, i) => (
            <motion.div
              key={job.id ?? i}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="surface-card border border-border p-6 rounded-2xl flex flex-col group hover:border-primary/50 transition-colors relative overflow-hidden shadow-sm"
            >
              <div className="absolute top-0 right-0 w-32 h-32 bg-primary/10 rounded-full blur-[40px] group-hover:bg-primary/20 transition-colors" />

              <div className="flex justify-between items-start mb-4 relative z-10">
                <div className="w-12 h-12 bg-muted rounded-xl flex items-center justify-center font-bold text-xl border border-border text-foreground">
                  {String(job.company || "C").charAt(0)}
                </div>
                <div className="flex flex-col items-end">
                  <div className="px-2.5 py-1 bg-emerald-500/10 text-emerald-400 rounded-lg text-xs font-bold border border-emerald-500/20">
                    {job.match}% Match
                  </div>
                </div>
              </div>

              <div className="relative z-10 flex-1">
                <h3 className="text-lg font-bold group-hover:text-primary transition-colors">{job.title}</h3>
                <p className="text-secondary-foreground text-sm font-medium mb-3">{job.company}</p>
                <p className="text-sm text-muted-foreground line-clamp-3 mb-4">{job.description}</p>

                <div className="flex flex-wrap gap-2 mb-6">
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground border border-border">
                    <MapPin className="w-3 h-3" /> {job.location_type}
                  </span>
                  <span className="flex items-center gap-1 text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground border border-border">
                    <IndianRupee className="w-3 h-3" />
                    {formatINR(job.salary_min_inr)} – {formatINR(job.salary_max_inr)}
                  </span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground border border-border">{job.job_type}</span>
                  <span className="text-xs px-2 py-1 bg-muted rounded-md text-muted-foreground border border-border">{job.experience_level}</span>
                </div>
              </div>

              <div className="flex gap-3 relative z-10 mt-auto">
                <button
                  type="button"
                  onClick={() => void save(job.id)}
                  className={`flex-1 py-2.5 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 border ${
                    job.saved
                      ? "bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/30"
                      : "bg-muted hover:bg-muted/80 text-foreground border-border"
                  }`}
                >
                  <Star className="w-4 h-4" /> {job.saved ? "Saved" : "Save"}
                </button>
                <button
                  type="button"
                  onClick={() => void apply(job.id)}
                  className="flex-1 py-2.5 bg-primary text-primary-foreground hover:bg-primary/90 rounded-xl font-medium transition-colors text-sm flex items-center justify-center gap-2 shadow-md"
                >
                  {job.applied ? "Applied" : "Apply"} <ExternalLink className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  );
}
