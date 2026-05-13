"use client";

import { motion } from "framer-motion";
import { BrainCircuit, Briefcase, FileText, BarChart, Zap, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { ReactNode } from "react";
import { HomeNav } from "@/components/HomeNav";
import { useAuthStore } from "@/store/authStore";
import { isTrialExpired } from "@/lib/trial";

const PRICING_CARDS = [
  {
    title: "FREE TRIAL",
    price: "₹0",
    period: "for 3 days",
    features: ["Resume analysis (limited)", "Basic roadmap", "Limited AI chats", "Limited interviews"],
    buttonText: "Start Free Trial",
    buttonLink: "/register?trial=true",
  },
  {
    title: "PRO PLAN",
    price: "₹499",
    period: "/month",
    features: [
      "Unlimited resume analysis",
      "Full roadmap generation",
      "Unlimited AI chat mentor",
      "Full mock interviews",
      "Job recommendations",
      "Skill gap analysis",
    ],
    recommended: true,
    buttonText: "Get Pro",
    buttonLink: "/register",
  },
  {
    title: "PREMIUM PLAN",
    price: "₹999",
    period: "/month",
    features: [
      "Everything in Pro",
      "Priority AI processing",
      "Advanced analytics",
      "Personalized AI mentor",
      "Interview deep analysis",
      "Resume rewriting",
    ],
    buttonText: "Get Premium",
    buttonLink: "/register",
  },
] as const;

export default function Home() {
  const token = useAuthStore((s) => s.token);
  const user = useAuthStore((s) => s.user);
  const pricingOnly = Boolean(token && user && isTrialExpired(user));

  if (pricingOnly) {
    return (
      <div className="min-h-screen relative flex flex-col items-center w-full bg-background text-foreground">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
        <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

        <HomeNav />

        <main className="flex-1 w-full max-w-7xl flex flex-col items-center px-6 z-10 pt-12 pb-24">
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center max-w-2xl mb-14"
          >
            <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">Your free trial has ended</h1>
            <p className="text-muted-foreground text-lg">
              You can preview plans below. Subscribe to regain access to the dashboard, resume tools, interviews, and
              job matching.
            </p>
          </motion.div>
          <PricingSection />
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen relative flex flex-col items-center w-full bg-background text-foreground">
      <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none" />
      <div className="absolute top-[20%] right-[-10%] w-[40%] h-[40%] rounded-full bg-primary/10 blur-[120px] pointer-events-none" />

      <HomeNav />

      <main className="flex-1 w-full max-w-7xl flex flex-col items-center text-center px-6 z-10 pt-20 pb-32">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full glass-panel border-primary/20 text-sm text-primary mb-8"
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary"></span>
          </span>
          Next-Gen AI Career Mentor
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-5xl md:text-7xl lg:text-8xl font-extrabold tracking-tight max-w-5xl mb-6 leading-[1.1] text-foreground"
        >
          Your autonomous AI <br />
          <span className="text-transparent bg-clip-text bg-gradient-to-r from-primary via-accent to-primary bg-300% animate-gradient">
            career strategist
          </span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg md:text-xl text-muted-foreground max-w-2xl mb-10"
        >
          Upload your resume. Discover skill gaps. Dominate mock interviews. Let multi-agent AI guide your career
          trajectory in real-time.
        </motion.p>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link
            href="/register?trial=true"
            className="px-8 py-4 bg-primary text-primary-foreground rounded-full font-semibold flex items-center justify-center gap-2 hover:bg-primary/90 transition-all shadow-[0_0_40px_-10px_rgba(79,70,229,0.5)]"
          >
            Start Free Trial <ArrowRight className="w-4 h-4" />
          </Link>
        </motion.div>
      </main>

      <section id="features" className="w-full py-32 px-6 relative z-10 border-t border-border bg-muted/40">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Multi-Agent Architecture</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
              Our specialized AI agents work autonomously to optimize every aspect of your career.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<FileText className="w-6 h-6 text-primary" />}
              title="Resume Optimizer"
              description="Analyzes ATS compatibility and auto-rewrites bullet points using generative AI to match target roles."
            />
            <FeatureCard
              icon={<Zap className="w-6 h-6 text-accent" />}
              title="Skill Gap Analyzer"
              description="Cross-references your profile with millions of job postings to identify exactly what you need to learn."
            />
            <FeatureCard
              icon={<Briefcase className="w-6 h-6 text-blue-400" />}
              title="Job Match Engine"
              description="Finds hidden opportunities and ranks them based on your exact skillset and career trajectory."
            />
          </div>
        </div>
      </section>

      <section id="how-it-works" className="w-full py-32 px-6 relative z-10">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-20">
            <h2 className="text-3xl md:text-5xl font-bold mb-4">How It Works</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Your journey to the perfect job in 6 simple steps.</p>
          </div>

          <div className="relative">
            <div className="absolute top-1/2 left-0 w-full h-1 bg-gradient-to-r from-primary/20 via-accent/50 to-primary/20 -translate-y-1/2 hidden lg:block rounded-full"></div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              <StepCard number="1" title="Upload Resume" desc="We parse your experience in seconds." icon={<FileText className="w-6 h-6 text-primary" />} />
              <StepCard number="2" title="AI Analysis" desc="Find ATS gaps & skill mismatches instantly." icon={<BrainCircuit className="w-6 h-6 text-accent" />} />
              <StepCard number="3" title="Custom Roadmap" desc="Get a tailored learning path to upskill." icon={<BarChart className="w-6 h-6 text-blue-400" />} />
              <StepCard number="4" title="Mock Interviews" desc="Practice with AI & get real-time feedback." icon={<Zap className="w-6 h-6 text-yellow-400" />} />
              <StepCard number="5" title="Match Jobs" desc="Apply to roles aligned with your real skills." icon={<Briefcase className="w-6 h-6 text-green-400" />} />
              <StepCard number="6" title="Track Progress" desc="Monitor your growth and land the job." icon={<CheckCircle2 className="w-6 h-6 text-primary" />} />
            </div>
          </div>
        </div>
      </section>

      <PricingSection />
    </div>
  );
}

function PricingSection() {
  return (
    <section id="pricing" className="w-full py-32 px-6 relative z-10 bg-muted/40 border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-20">
          <h2 className="text-3xl md:text-5xl font-bold mb-4 text-foreground">Simple, transparent pricing</h2>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">Choose the perfect plan for your career trajectory.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-5xl mx-auto">
          {PRICING_CARDS.map((card) => (
            <PricingCard key={card.title} {...card} />
          ))}
        </div>
      </div>
    </section>
  );
}

function FeatureCard({ icon, title, description }: { icon: ReactNode; title: string; description: string }) {
  return (
    <div className="glass-panel p-8 hover:bg-muted/50 transition-colors cursor-default group relative overflow-hidden border border-border">
      <div className="absolute inset-0 bg-gradient-to-br from-foreground/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
      <div className="w-12 h-12 rounded-xl bg-muted flex items-center justify-center mb-6 group-hover:scale-110 transition-transform relative z-10 border border-border">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3 relative z-10 text-foreground">{title}</h3>
      <p className="text-muted-foreground leading-relaxed relative z-10">{description}</p>
    </div>
  );
}

function StepCard({ number, title, desc, icon }: { number: string; title: string; desc: string; icon: ReactNode }) {
  return (
    <div className="glass-panel p-8 relative flex flex-col items-center text-center group hover:bg-muted/50 transition-colors hover:-translate-y-2 duration-300 border border-border">
      <div className="w-12 h-12 rounded-full border-2 border-border flex items-center justify-center absolute -top-6 text-xl font-bold bg-card text-foreground">
        {number}
      </div>
      <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center mb-6 mt-4 group-hover:scale-110 transition-transform border border-border">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2 text-foreground">{title}</h3>
      <p className="text-muted-foreground">{desc}</p>
    </div>
  );
}

function PricingCard({
  title,
  price,
  period,
  features,
  recommended = false,
  buttonText,
  buttonLink,
}: {
  title: string;
  price: string;
  period: string;
  features: readonly string[];
  recommended?: boolean;
  buttonText: string;
  buttonLink: string;
}) {
  return (
    <div
      className={`glass-panel p-8 rounded-3xl flex flex-col relative border ${recommended ? "border-primary/50 shadow-[0_0_30px_-10px_rgba(79,70,229,0.4)] transform md:-translate-y-4" : "border-border"}`}
    >
      {recommended && (
        <div className="absolute -top-4 left-1/2 -translate-x-1/2 bg-primary text-primary-foreground text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
          Recommended
        </div>
      )}
      <h3 className="text-lg font-semibold text-muted-foreground mb-4">{title}</h3>
      <div className="mb-6 flex items-baseline gap-1">
        <span className="text-5xl font-extrabold text-foreground">{price}</span>
        <span className="text-muted-foreground">{period}</span>
      </div>
      <div className="flex-1 space-y-4 mb-8">
        {features.map((f, i) => (
          <div key={i} className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-primary shrink-0" />
            <span className="text-sm text-foreground">{f}</span>
          </div>
        ))}
      </div>
      <Link
        href={buttonLink}
        className={`w-full py-4 rounded-xl font-bold flex items-center justify-center transition-colors ${
          recommended ? "bg-primary text-primary-foreground hover:bg-primary/90" : "bg-muted text-foreground hover:bg-muted/80 border border-border"
        }`}
      >
        {buttonText}
      </Link>
    </div>
  );
}
