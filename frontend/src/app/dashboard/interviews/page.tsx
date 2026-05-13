"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MessageSquare,
  Mic,
  MicOff,
  Settings2,
  Play,
  Activity,
  CheckCircle2,
  AlertTriangle,
  Clock,
  RefreshCw,
} from "lucide-react";
import { useAuthStore } from "@/store/authStore";

declare global {
  interface Window {
    SpeechRecognition: any;
    webkitSpeechRecognition: any;
  }
}

const API = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api/v1";

const INTERVIEW_TYPES = [
  "Behavioral & Culture Fit",
  "System Design",
  "Frontend Technical",
  "Backend Technical",
  "Full Stack",
  "HR Screening",
  "AI/ML",
  "Data Structures & Algorithms",
  "Database Systems",
  "Cloud & DevOps",
  "OOPs",
  "Operating Systems",
  "Cybersecurity",
  "Mobile Development",
];

const DIFFICULTIES = ["Easy", "Medium", "Hard"];

const FALLBACK_QUESTION = {
  question:
    "Describe a project where you had to learn a new technology quickly. How did you approach it?",
  hints: ["Focus on learning strategy"],
  ideal_answer_key_points: ["Research approach", "Hands-on practice", "Knowledge transfer", "Outcome"],
};

export default function MockInterviews() {
  const [interviewState, setInterviewState] = useState<"idle" | "active" | "evaluating" | "feedback">("idle");
  const [questionData, setQuestionData] = useState<any>(null);
  const [feedbackData, setFeedbackData] = useState<any>(null);
  const [isRecording, setIsRecording] = useState(false);
  /** Live speech caption (interim + final). */
  const [transcript, setTranscript] = useState("");
  /** Typed answer when the mic is unavailable or you prefer typing. */
  const [typedAnswer, setTypedAnswer] = useState("");
  const [micHint, setMicHint] = useState<string | null>(null);
  const [selectedType, setSelectedType] = useState("Behavioral & Culture Fit");
  const [selectedDifficulty, setSelectedDifficulty] = useState("Medium");
  const [lockedType, setLockedType] = useState("Behavioral & Culture Fit");
  const [lockedDifficulty, setLockedDifficulty] = useState("Medium");
  const [history, setHistory] = useState<any[]>([]);
  const [questionNumber, setQuestionNumber] = useState(0);
  const [questionLoading, setQuestionLoading] = useState(false);
  const recognitionRef = useRef<any>(null);
  const speechFinalRef = useRef("");
  const sessionAskedRef = useRef<string[]>([]);
  const token = useAuthStore((s) => s.token);

  const speechSupported =
    typeof window !== "undefined" && !!(window.SpeechRecognition || window.webkitSpeechRecognition);

  useEffect(() => {
    fetch(`${API}/dashboard/interviews/history`, {
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    })
      .then((r) => r.json())
      .then((data) => setHistory(data.sessions || []))
      .catch(() => {});
  }, [token, interviewState]);

  const stopRecognition = useCallback(() => {
    try {
      recognitionRef.current?.stop();
    } catch {
      /* ignore */
    }
    recognitionRef.current = null;
    setIsRecording(false);
  }, []);

  const toggleRecording = () => {
    setMicHint(null);
    if (isRecording) {
      stopRecognition();
      return;
    }
    if (typeof window === "undefined") return;
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      setMicHint("Speech recognition is not available in this browser. Type your answer in the box below.");
      return;
    }
    stopRecognition();
    speechFinalRef.current = "";
    setTranscript("");
    try {
      const rec = new SpeechRecognition();
      rec.continuous = true;
      rec.interimResults = true;
      rec.lang = "en-US";
      rec.onresult = (event: any) => {
        let interim = "";
        for (let i = event.resultIndex; i < event.results.length; i++) {
          const r = event.results[i];
          if (r.isFinal) {
            speechFinalRef.current += r[0]?.transcript || "";
          } else {
            interim += r[0]?.transcript || "";
          }
        }
        setTranscript((speechFinalRef.current + interim).trim());
      };
      rec.onerror = (event: any) => {
        if (event.error === "not-allowed") {
          setMicHint("Microphone permission was denied. Allow the mic for this site, or type your answer below.");
        } else if (event.error !== "aborted" && event.error !== "no-speech") {
          setMicHint(`Voice capture paused (${event.error}). You can still type your answer.`);
        }
        setIsRecording(false);
        recognitionRef.current = null;
      };
      rec.onend = () => {
        setIsRecording(false);
        recognitionRef.current = null;
      };
      recognitionRef.current = rec;
      rec.start();
      setIsRecording(true);
    } catch {
      setMicHint("Could not start the microphone. Type your answer in the box below.");
      setIsRecording(false);
    }
  };

  const applyQuestionPayload = useCallback((data: any, typeUsed: string, diffUsed: string) => {
    const q = data?.question;
    if (!q) return false;
    sessionAskedRef.current = [...sessionAskedRef.current, q];
    setLockedType(typeUsed);
    setLockedDifficulty(diffUsed);
    setQuestionData(data);
    setTranscript("");
    setTypedAnswer("");
    setFeedbackData(null);
    setQuestionNumber((n) => n + 1);
    setInterviewState("active");
    return true;
  }, []);

  /** Fetches using current sidebar `selectedType` / `selectedDifficulty` only when invoked (Start / Refresh / Next). */
  const fetchNewQuestion = useCallback(async () => {
    if (!token) return false;
    const typeUsed = selectedType;
    const diffUsed = selectedDifficulty;
    setQuestionLoading(true);
    try {
      const controller = new AbortController();
      const tid = window.setTimeout(() => controller.abort(), 90_000);
      let got = false;
      try {
        const res = await fetch(`${API}/interview/generate-questions`, {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            interview_type: typeUsed,
            difficulty_level: diffUsed,
            exclude_questions: sessionAskedRef.current,
          }),
          signal: controller.signal,
        });
        const data = await res.json().catch(() => ({}));
        if (res.ok && data?.question) {
          got = applyQuestionPayload(data, typeUsed, diffUsed);
        }
      } finally {
        window.clearTimeout(tid);
      }
      if (!got) {
        applyQuestionPayload({ ...FALLBACK_QUESTION }, typeUsed, diffUsed);
      }
      return true;
    } catch {
      applyQuestionPayload({ ...FALLBACK_QUESTION }, typeUsed, diffUsed);
      return true;
    } finally {
      setQuestionLoading(false);
    }
  }, [token, selectedType, selectedDifficulty, applyQuestionPayload]);

  const startInterview = async () => {
    if (!token || questionLoading) return;
    await fetchNewQuestion();
  };

  const refreshQuestions = async () => {
    if (!token || questionLoading) return;
    await fetchNewQuestion();
  };

  const submitAnswer = () => {
    if (!questionData) return;
    if (isRecording) stopRecognition();
    setInterviewState("evaluating");

    const userAnswer = [transcript.trim(), typedAnswer.trim()].filter(Boolean).join("\n\n");

    fetch(`${API}/dashboard/interviews/evaluate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
      body: JSON.stringify({
        question: questionData.question,
        user_answer: userAnswer,
        ideal_points: questionData.ideal_answer_key_points,
        interview_type: lockedType,
        difficulty: lockedDifficulty,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (typeof data.score !== "number") throw new Error("Invalid");
        setFeedbackData(data);
        setInterviewState("feedback");
      })
      .catch(() => {
        const score = !userAnswer ? 10 : userAnswer.length < 20 ? 25 : 55;
        setFeedbackData({
          score,
          feedback:
            score < 20
              ? "No answer provided. Please use the microphone or type your answer in the text box."
              : "Your answer needs more depth and specificity.",
          passed: score >= 60,
          strengths: score > 30 ? ["Attempted answer"] : [],
          weaknesses: ["Needs more detail"],
        });
        setInterviewState("feedback");
      });
  };

  const endSession = () => {
    stopRecognition();
    setInterviewState("idle");
    setQuestionData(null);
    setFeedbackData(null);
    setTranscript("");
    setTypedAnswer("");
    setMicHint(null);
    sessionAskedRef.current = [];
    setQuestionNumber(0);
  };

  const avgScore =
    history.length > 0 ? Math.round(history.reduce((s, h) => s + (h.score || 0), 0) / history.length) : 0;

  const selectionDiffersFromLocked =
    interviewState === "active" && (selectedType !== lockedType || selectedDifficulty !== lockedDifficulty);

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-2">
            <MessageSquare className="text-primary w-8 h-8" />
            AI Mock Interviews
          </h1>
          <p className="text-secondary-foreground mt-1">
            Practice with the AI interviewer. Press <strong>Start Interview</strong> or <strong>Refresh questions</strong>{" "}
            to load a question. Use the microphone (Chrome or Edge) or type your answer — both are sent when you submit.
          </p>
        </div>
        {questionNumber > 0 && (
          <div className="px-4 py-2 rounded-xl text-sm border border-border bg-card text-foreground shadow-sm">
            Question #{questionNumber}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="lg:col-span-2 surface-card border border-border p-8 rounded-2xl relative overflow-hidden min-h-[400px]"
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-primary/10 rounded-full blur-[80px] pointer-events-none" />

          <div className="relative z-10 space-y-6">
            <AnimatePresence mode="wait">
              {interviewState === "active" && questionData && (
                <motion.div
                  key="active"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0 }}
                  className={`space-y-4 ${questionLoading ? "opacity-60 pointer-events-none" : ""}`}
                >
                  <div className="p-6 bg-muted/50 border border-border rounded-xl relative">
                    {questionLoading && (
                      <div className="absolute inset-0 z-20 flex items-center justify-center rounded-xl bg-background/40">
                        <div className="w-12 h-12 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                      </div>
                    )}
                    <div className="flex flex-wrap justify-between items-center gap-2 mb-2">
                      <h4 className="font-bold text-primary uppercase tracking-wider text-xs">AI Question</h4>
                      <span className="text-xs text-muted-foreground px-2 py-1 bg-muted border border-border rounded">
                        {lockedType} • {lockedDifficulty}
                      </span>
                    </div>
                    {selectionDiffersFromLocked && (
                      <p className="text-xs text-amber-600 dark:text-amber-400 mb-2">
                        Sidebar selection differs from this question. Click Refresh to load a question for your new
                        type or difficulty.
                      </p>
                    )}
                    <p className="text-lg leading-relaxed text-foreground">{questionData.question}</p>
                    {questionData.hints && (
                      <div className="mt-3 flex gap-2 flex-wrap">
                        {questionData.hints.map((h: string, i: number) => (
                          <span key={i} className="text-xs px-2 py-1 bg-primary/10 text-primary rounded-lg border border-primary/20">
                            💡 {h}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="p-6 bg-muted/40 border border-border rounded-xl relative min-h-[120px] space-y-3">
                    {!speechSupported && (
                      <p className="text-xs text-amber-600 dark:text-amber-400">
                        This browser does not support live speech capture. Type your full answer in the box below.
                      </p>
                    )}
                    <div className="min-h-[4rem]">
                      {transcript ? (
                        <p className="text-foreground leading-relaxed whitespace-pre-wrap">{transcript}</p>
                      ) : (
                        <p className="text-muted-foreground italic text-center py-6 px-4">
                          {speechSupported
                            ? "Click the mic to dictate your answer, or type below."
                            : "Type your answer in the box below."}
                        </p>
                      )}
                    </div>
                    <div>
                      <label htmlFor="interview-typed-answer" className="text-xs font-medium text-muted-foreground">
                        Typed answer (optional — combined with voice when you submit)
                      </label>
                      <textarea
                        id="interview-typed-answer"
                        value={typedAnswer}
                        onChange={(e) => setTypedAnswer(e.target.value)}
                        rows={5}
                        placeholder="Write your answer here if you prefer typing or to supplement the mic."
                        className="mt-1 w-full rounded-xl px-3 py-2.5 bg-input border border-border text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring/30 resize-y min-h-[100px]"
                      />
                    </div>
                  </div>

                  <div className="flex justify-center my-4">
                    <button
                      type="button"
                      onClick={toggleRecording}
                      disabled={questionLoading || !speechSupported}
                      className={`p-5 rounded-full flex items-center justify-center shadow-lg transition-all disabled:opacity-50 ${
                        isRecording
                          ? "bg-red-500 animate-pulse shadow-red-500/30"
                          : "bg-primary hover:bg-primary/90 shadow-primary/30"
                      }`}
                    >
                      {isRecording ? (
                        <MicOff className="w-7 h-7 text-primary-foreground" />
                      ) : (
                        <Mic className="w-7 h-7 text-primary-foreground" />
                      )}
                    </button>
                  </div>
                  <p className="text-center text-xs text-muted-foreground">
                    {isRecording ? "🔴 Recording... Click to stop" : "Click the microphone to dictate (Chrome / Edge recommended)"}
                  </p>
                  {micHint && (
                    <p className="text-center text-xs text-amber-600 dark:text-amber-400 max-w-lg mx-auto">{micHint}</p>
                  )}

                  <div className="flex flex-col sm:flex-row gap-3 mt-6">
                    <button
                      type="button"
                      onClick={refreshQuestions}
                      disabled={questionLoading}
                      className="sm:flex-initial py-3 px-4 border border-border bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${questionLoading ? "animate-spin" : ""}`} />
                      Refresh
                    </button>
                    <button
                      type="button"
                      onClick={endSession}
                      disabled={questionLoading}
                      className="flex-1 py-3 border border-border bg-card text-secondary-foreground hover:bg-muted rounded-xl font-bold transition-colors disabled:opacity-50"
                    >
                      End Session
                    </button>
                    <button
                      type="button"
                      onClick={submitAnswer}
                      disabled={questionLoading || (!transcript.trim() && !typedAnswer.trim())}
                      className="flex-1 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors shadow-md disabled:opacity-50"
                    >
                      Submit Answer
                    </button>
                  </div>
                </motion.div>
              )}

              {interviewState === "evaluating" && (
                <motion.div
                  key="eval"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex flex-col items-center justify-center space-y-4 py-16"
                >
                  <div className="w-16 h-16 border-4 border-primary/30 border-t-primary rounded-full animate-spin" />
                  <h3 className="text-xl font-bold text-foreground">AI is evaluating your response...</h3>
                  <p className="text-sm text-muted-foreground text-center max-w-md">
                    Analyzing technical accuracy, communication quality, and completeness
                  </p>
                </motion.div>
              )}

              {interviewState === "feedback" && feedbackData && (
                <motion.div
                  key="feedback"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="space-y-6"
                >
                  <div
                    className={`p-6 rounded-xl border flex items-start gap-4 ${
                      feedbackData.passed
                        ? "bg-emerald-500/10 border-emerald-500/30"
                        : "bg-red-500/10 border-red-500/30"
                    }`}
                  >
                    {feedbackData.passed ? (
                      <CheckCircle2 className="w-10 h-10 text-emerald-500 shrink-0" />
                    ) : (
                      <AlertTriangle className="w-10 h-10 text-red-500 shrink-0" />
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-4 mb-2 flex-wrap">
                        <h3
                          className={`text-2xl font-black ${feedbackData.passed ? "text-emerald-500" : "text-red-500"}`}
                        >
                          {feedbackData.score}/100
                        </h3>
                        <span
                          className={`text-xs px-2 py-1 rounded-full font-bold ${
                            feedbackData.passed
                              ? "bg-emerald-500/20 text-emerald-600 dark:text-emerald-400"
                              : "bg-red-500/20 text-red-600 dark:text-red-400"
                          }`}
                        >
                          {feedbackData.passed ? "PASSED" : "NEEDS WORK"}
                        </span>
                      </div>
                      <p className="text-foreground leading-relaxed">{feedbackData.feedback}</p>
                    </div>
                  </div>

                  {(feedbackData.strengths?.length > 0 || feedbackData.weaknesses?.length > 0) && (
                    <div className="grid md:grid-cols-2 gap-4">
                      {feedbackData.strengths?.length > 0 && (
                        <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl">
                          <h4 className="font-bold text-emerald-600 dark:text-emerald-400 text-sm mb-2">Strengths</h4>
                          <ul className="space-y-1">
                            {feedbackData.strengths.map((s: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                ✓ {s}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                      {feedbackData.weaknesses?.length > 0 && (
                        <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-xl">
                          <h4 className="font-bold text-red-600 dark:text-red-400 text-sm mb-2">Areas to Improve</h4>
                          <ul className="space-y-1">
                            {feedbackData.weaknesses.map((w: string, i: number) => (
                              <li key={i} className="text-sm text-muted-foreground">
                                ✗ {w}
                              </li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  )}

                  <div className="flex flex-col sm:flex-row justify-end gap-3">
                    <button
                      type="button"
                      onClick={endSession}
                      className="px-6 py-3 border border-border bg-card hover:bg-muted rounded-xl font-bold transition-colors text-foreground"
                    >
                      Done
                    </button>
                    <button
                      type="button"
                      onClick={refreshQuestions}
                      disabled={questionLoading}
                      className="px-6 py-3 bg-primary hover:bg-primary/90 text-primary-foreground rounded-xl font-bold transition-colors shadow-md disabled:opacity-50 flex items-center justify-center gap-2"
                    >
                      <RefreshCw className={`w-4 h-4 ${questionLoading ? "animate-spin" : ""}`} />
                      Next question
                    </button>
                  </div>
                </motion.div>
              )}

              {interviewState === "idle" && (
                <motion.div key="idle" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-center space-y-6 py-8">
                  <div className="w-24 h-24 bg-muted border border-border rounded-full mx-auto flex items-center justify-center relative">
                    {questionLoading && (
                      <div className="absolute inset-0 rounded-full border-2 border-primary border-t-transparent animate-spin" />
                    )}
                    <Mic className={`w-10 h-10 ${questionLoading ? "text-foreground" : "text-primary"}`} />
                  </div>

                  <div>
                    <h3 className="text-2xl font-bold mb-2 text-foreground">
                      {questionLoading ? "Generating question..." : "Ready to start?"}
                    </h3>
                    <p className="text-muted-foreground max-w-md mx-auto">
                      Choose interview type and difficulty, then click <strong>Start Interview</strong> or{" "}
                      <strong>Refresh questions</strong> in the sidebar to generate your first question.
                    </p>
                  </div>

                  <div className="flex flex-col sm:flex-row justify-center gap-4">
                    <button
                      type="button"
                      onClick={startInterview}
                      disabled={questionLoading || !token}
                      className="px-8 py-4 bg-primary hover:bg-primary/90 disabled:opacity-50 text-primary-foreground rounded-full font-bold shadow-md flex items-center gap-2 transition-all hover:scale-[1.02] justify-center"
                    >
                      <Play className="w-5 h-5 fill-current" /> Start Interview
                    </button>
                  </div>
                  {!token && (
                    <p className="text-sm text-amber-600 dark:text-amber-400">Sign in to generate interview questions.</p>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="space-y-6"
        >
          <div className="surface-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-2 flex items-center gap-2 text-foreground">
              <Settings2 className="w-5 h-5 text-muted-foreground" />
              Session Config
            </h3>
            <p className="text-xs text-muted-foreground mb-4">
              Changing type or difficulty updates the next question. Use <strong>Refresh questions</strong> before you
              start, or any time during a session, to load a question for your current selections.
            </p>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Interview Type</label>
                <select
                  value={selectedType}
                  onChange={(e) => setSelectedType(e.target.value)}
                  className="w-full bg-input border border-border rounded-xl px-4 py-3 text-foreground focus:outline-none focus:ring-2 focus:ring-ring transition-colors appearance-none cursor-pointer"
                >
                  {INTERVIEW_TYPES.map((t) => (
                    <option key={t} value={t}>
                      {t}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium text-muted-foreground">Difficulty</label>
                <div className="flex bg-muted rounded-xl p-1 border border-border">
                  {DIFFICULTIES.map((d) => (
                    <button
                      key={d}
                      type="button"
                      onClick={() => setSelectedDifficulty(d)}
                      className={`flex-1 py-2 text-sm rounded-lg transition-all ${
                        selectedDifficulty === d
                          ? "bg-card text-foreground font-medium shadow-sm border border-border"
                          : "text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {d}
                    </button>
                  ))}
                </div>
              </div>
              <button
                type="button"
                onClick={refreshQuestions}
                disabled={questionLoading || !token}
                className="w-full py-3 border border-border bg-muted text-foreground rounded-xl font-bold hover:bg-muted/80 transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${questionLoading ? "animate-spin" : ""}`} />
                Refresh questions
              </button>
            </div>
          </div>

          <div className="surface-card border border-border p-6 rounded-2xl shadow-sm">
            <h3 className="font-bold mb-4 flex items-center gap-2 text-foreground">
              <Activity className="w-5 h-5 text-emerald-500" />
              Past Performance
            </h3>
            {history.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No interviews yet. Start one above!</p>
            ) : (
              <div className="space-y-3">
                <div className="p-3 bg-muted rounded-xl border border-border text-center">
                  <div className="text-2xl font-black text-foreground">{avgScore}</div>
                  <div className="text-xs text-muted-foreground">Average Score ({history.length} sessions)</div>
                </div>
                {history.slice(0, 5).map((s, i) => (
                  <div key={i} className="flex justify-between items-center p-3 bg-muted/50 rounded-xl border border-border">
                    <div className="min-w-0 pr-2">
                      <div className="text-sm font-bold text-foreground truncate">{s.type}</div>
                      <div className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3 shrink-0" />
                        {s.created_at ? new Date(s.created_at).toLocaleDateString() : "Recent"}
                      </div>
                    </div>
                    <div className={`font-bold shrink-0 ${(s.score || 0) >= 60 ? "text-emerald-500" : "text-red-500"}`}>
                      {s.score || 0}/100
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
