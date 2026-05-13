"use client";

import Link from "next/link";
import { Check, CreditCard, Sparkles, Zap } from "lucide-react";
import { motion } from "framer-motion";

const PLANS = [
  {
    id: "starter",
    name: "Starter",
    price: "₹0",
    period: "/ month",
    description: "Core tools for early career exploration.",
    features: ["Resume ATS scan (limited)", "5 job saves", "1 roadmap / month", "Community support"],
    cta: "Current plan",
    highlighted: false,
    disabled: true,
  },
  {
    id: "pro",
    name: "Pro",
    price: "₹999",
    period: "/ month",
    description: "Full AI mentorship for active job seekers.",
    features: [
      "Unlimited resume rewrites",
      "Full mock interviews + scoring",
      "Jobs match filters + alerts",
      "Skill gap deep dives",
      "Priority roadmap updates",
    ],
    cta: "Upgrade to Pro",
    highlighted: true,
    disabled: false,
  },
  {
    id: "team",
    name: "Team",
    price: "₹4,999",
    period: "/ month",
    description: "For bootcamps and cohort-based programs.",
    features: ["Up to 25 seats", "Shared analytics", "Custom branding (add-on)", "Dedicated success manager"],
    cta: "Contact sales",
    highlighted: false,
    disabled: false,
  },
];

export default function DashboardPricingPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-10 pb-12">
      <div className="text-center space-y-3">
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Upgrade your plan</h1>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          In-app billing is almost here. Review plans below, then complete checkout with our secure provider when you are ready.
        </p>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        {PLANS.map((plan, i) => (
          <motion.div
            key={plan.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`rounded-2xl border p-8 flex flex-col ${
              plan.highlighted
                ? "border-primary bg-card shadow-[0_0_40px_-12px_rgba(79,70,229,0.45)] ring-1 ring-primary/30"
                : "border-border bg-card"
            }`}
          >
            <div className="flex items-center gap-2 mb-2">
              {plan.highlighted ? <Zap className="w-5 h-5 text-primary" /> : <Sparkles className="w-5 h-5 text-muted-foreground" />}
              <h2 className="text-xl font-bold text-foreground">{plan.name}</h2>
            </div>
            <p className="text-sm text-muted-foreground mb-6 min-h-[40px]">{plan.description}</p>
            <div className="mb-6">
              <span className="text-4xl font-black text-foreground">{plan.price}</span>
              <span className="text-muted-foreground text-sm">{plan.period}</span>
            </div>
            <ul className="space-y-3 mb-8 flex-1">
              {plan.features.map((f) => (
                <li key={f} className="flex items-start gap-2 text-sm text-foreground">
                  <Check className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                  {f}
                </li>
              ))}
            </ul>
            <button
              type="button"
              disabled={plan.disabled}
              className={`w-full py-3 rounded-xl font-bold transition-all flex items-center justify-center gap-2 ${
                plan.highlighted
                  ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-lg"
                  : "bg-muted text-foreground border border-border hover:bg-muted/80"
              } ${plan.disabled ? "opacity-60 cursor-not-allowed" : ""}`}
              onClick={() => {
                if (plan.disabled) return;
                // Razorpay / Stripe checkout placeholder
                alert(
                  "Payment checkout will open here (Razorpay or Stripe). Wire your publishable key and create a Checkout Session on the backend to go live."
                );
              }}
            >
              <CreditCard className="w-4 h-4" />
              {plan.cta}
            </button>
          </motion.div>
        ))}
      </div>

      <div className="glass-panel rounded-2xl p-6 border border-border">
        <h3 className="font-bold text-foreground mb-2">Payment integration</h3>
        <p className="text-sm text-muted-foreground leading-relaxed">
          Backend endpoints for <strong className="text-foreground">Razorpay Orders</strong> or{" "}
          <strong className="text-foreground">Stripe Checkout Sessions</strong> can be added next to this page. Client
          code should call your API, receive a client secret or order id, then redirect or embed the hosted checkout.
        </p>
        <div className="mt-4 flex flex-wrap gap-3">
          <Link href="/dashboard/settings" className="text-sm text-primary font-semibold hover:underline">
            Billing preferences (coming soon)
          </Link>
          <span className="text-muted-foreground">·</span>
          <Link href="/dashboard" className="text-sm text-primary font-semibold hover:underline">
            Back to dashboard
          </Link>
        </div>
      </div>
    </div>
  );
}
