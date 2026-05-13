"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { UploadCloud, FileText, CheckCircle2, AlertTriangle, ArrowRight, Star, Cpu, BarChart3 } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

export default function ResumeAnalyzer() {
  const [file, setFile] = useState<File | null>(null);
  const [targetRole, setTargetRole] = useState("Software Engineer");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState<any>(null);
  const token = useAuthStore((s) => s.token);

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setIsAnalyzing(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("target_role", targetRole);

    try {
      const response = await fetch(`${API}/resume/analyze`, {
        method: "POST",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
        body: formData,
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.detail || "Analyze failed");
      setAnalysis(data.analysis);
    } catch (error) {
      console.error("Error analyzing resume:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const sectionEntries = analysis?.section_scores
    ? Object.entries(analysis.section_scores as Record<string, number>)
    : [];

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <FileText className="text-primary w-8 h-8" />
            Resume AI Optimizer
          </h1>
          <p className="text-secondary-foreground mt-1">
            PDF/DOCX text extraction, deterministic ATS signals, and model-assisted recommendations vs your target role.
          </p>
        </div>
      </div>

      {!analysis ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="grid md:grid-cols-2 gap-8">
          <div className="glass-panel p-8 rounded-2xl flex flex-col items-center justify-center border-dashed border-2 border-white/10 hover:border-primary/50 transition-colors relative group h-[400px]">
            <input
              type="file"
              accept=".pdf,.docx"
              className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
            />
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
              <UploadCloud className="w-10 h-10 text-primary" />
            </div>
            <h3 className="text-xl font-bold text-center mb-2">
              {file ? file.name : "Drag & Drop Resume (PDF or DOCX)"}
            </h3>
            <p className="text-secondary-foreground text-center mb-6 text-sm max-w-xs">
              {file ? "File ready for analysis." : "Support for PDF and DOCX formats up to 5MB."}
            </p>
            <div className="px-6 py-2 bg-white/5 rounded-full text-sm text-secondary-foreground">Click to browse files</div>
          </div>

          <div className="glass-panel p-8 rounded-2xl flex flex-col justify-between">
            <div>
              <h3 className="text-xl font-bold mb-6 flex items-center gap-2">
                <Cpu className="text-accent w-5 h-5" />
                Analysis Configuration
              </h3>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-secondary-foreground">Target Role / Job Title</label>
                  <input
                    type="text"
                    value={targetRole}
                    onChange={(e) => setTargetRole(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:border-primary transition-colors"
                    placeholder="e.g. Senior Frontend Engineer"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={handleUpload}
              disabled={!file || isAnalyzing}
              className={`w-full py-4 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
                !file || isAnalyzing ? "bg-white/5 text-white/30 cursor-not-allowed" : "bg-primary text-white shadow-[0_0_30px_-5px_rgba(79,70,229,0.5)] hover:scale-[1.02]"
              }`}
            >
              {isAnalyzing ? (
                <>
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  Agents are analyzing...
                </>
              ) : (
                <>
                  <Star className="w-5 h-5" />
                  Analyze Resume
                </>
              )}
            </button>
          </div>
        </motion.div>
      ) : (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-8">
          <div className="grid md:grid-cols-3 gap-6">
            <div className="glass-panel p-6 rounded-2xl flex flex-col items-center justify-center relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-[40px]" />
              <div className="text-secondary-foreground font-medium mb-2">Overall ATS Score</div>
              <div className="text-6xl font-black text-emerald-400 mb-2">{analysis.ats_score}</div>
              <div className="text-sm text-secondary-foreground text-center">
                Keyword match: <span className="text-white font-bold">{analysis.keyword_match_percent ?? "—"}%</span>
              </div>
            </div>

            <div className="md:col-span-2 glass-panel p-6 rounded-2xl">
              <h3 className="font-bold text-lg mb-3">AI Feedback</h3>
              <p className="text-secondary-foreground leading-relaxed">{analysis.summary_feedback}</p>
              {analysis.role_alignment_notes && (
                <p className="text-sm text-secondary-foreground mt-4 border-t border-white/10 pt-4">{analysis.role_alignment_notes}</p>
              )}
              {analysis.role_target_mismatch && (
                <div className="mt-4 p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-200 text-sm">{analysis.role_target_mismatch}</div>
              )}
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl">
            <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-primary" />
              Section-wise scoring
            </h3>
            <div className="grid md:grid-cols-2 gap-3">
              {sectionEntries.length === 0 ? (
                <p className="text-sm text-secondary-foreground">No section scores returned.</p>
              ) : (
                sectionEntries.map(([k, v]) => (
                  <div key={k} className="p-3 rounded-xl bg-white/5 border border-white/5 flex justify-between items-center">
                    <span className="text-sm capitalize text-secondary-foreground">{k}</span>
                    <span className="text-sm font-bold">{Number(v)}</span>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-6">
            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-red-500/50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <AlertTriangle className="text-red-400 w-5 h-5" />
                Keyword gaps
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.keyword_gap || analysis.missing_skills || []).slice(0, 16).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-red-500/10 text-red-400 rounded-lg text-sm font-medium border border-red-500/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="glass-panel p-6 rounded-2xl border-l-4 border-l-emerald-500/50">
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                <CheckCircle2 className="text-emerald-400 w-5 h-5" />
                Matched strengths
              </h3>
              <div className="flex flex-wrap gap-2">
                {(analysis.matched_keywords || analysis.strong_skills || []).slice(0, 16).map((skill: string, i: number) => (
                  <span key={i} className="px-3 py-1.5 bg-emerald-500/10 text-emerald-400 rounded-lg text-sm font-medium border border-emerald-500/20">
                    {skill}
                  </span>
                ))}
              </div>
            </div>
          </div>

          <div className="glass-panel p-6 rounded-2xl space-y-6">
            <h3 className="font-bold text-lg flex items-center gap-2">
              <Star className="text-primary w-5 h-5" />
              AI suggested revisions
            </h3>

            <div className="space-y-4">
              {(analysis.improved_bullets || []).map((bullet: any, i: number) => (
                <div key={i} className="flex flex-col md:flex-row gap-4 p-4 rounded-xl bg-white/5 border border-white/5">
                  <div className="flex-1">
                    <div className="text-xs font-bold text-red-400 uppercase tracking-wider mb-2">Original</div>
                    <p className="text-sm text-secondary-foreground">{bullet.original}</p>
                  </div>
                  <div className="hidden md:flex items-center justify-center">
                    <ArrowRight className="text-primary w-5 h-5" />
                  </div>
                  <div className="flex-1">
                    <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">AI improved</div>
                    <p className="text-sm text-white font-medium">{bullet.improved}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button onClick={() => setAnalysis(null)} className="px-6 py-3 bg-white/10 hover:bg-white/20 rounded-xl font-medium transition-colors">
            Analyze another resume
          </button>
        </motion.div>
      )}
    </div>
  );
}
