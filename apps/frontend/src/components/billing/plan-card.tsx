"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

export interface PlanTier {
  name: string;
  priceMonthly: string;
  priceYearly: string;
  description: string;
  features: string[];
  highlighted?: boolean;
}

interface PlanCardProps {
  plan: PlanTier;
  active?: boolean;
  onSelect?: () => void;
}

export function PlanCard({ plan, active, onSelect }: PlanCardProps) {
  return (
    <motion.div
      className={cn(
        "flex h-full flex-col justify-between rounded-2xl border p-6 shadow-sm",
        plan.highlighted
          ? "border-teal-400/70 bg-gradient-to-br from-teal-500/10 via-slate-950/90 to-slate-950/70"
          : "border-slate-800/80 bg-slate-950/70",
        active ? "ring-1 ring-teal-400/70" : ""
      )}
      whileHover={{ y: -6, scale: 1.01 }}
      transition={{ duration: 0.2 }}
    >
      <div className="space-y-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-teal-300/70">{plan.name}</p>
          <h3 className="text-2xl font-semibold text-white">{plan.priceMonthly}</h3>
          <p className="text-sm text-slate-400">{plan.priceYearly} billed annually</p>
        </div>
        <p className="text-sm text-slate-300">{plan.description}</p>
        <ul className="space-y-2 text-sm text-slate-300">
          {plan.features.map((feature) => (
            <li key={feature} className="flex items-start gap-2">
              <span className="mt-1 h-1.5 w-1.5 rounded-full bg-teal-400/80" />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
      </div>
      <button
        className={cn(
          "mt-6 w-full rounded-xl border px-4 py-2 text-sm font-semibold transition",
          plan.highlighted
            ? "border-teal-400/60 bg-teal-500/10 text-teal-100 hover:bg-teal-500/20"
            : "border-slate-700/70 bg-slate-900/80 text-slate-200 hover:border-teal-400/60"
        )}
        type="button"
        onClick={onSelect}
      >
        {active ? "Current plan" : "Select plan"}
      </button>
    </motion.div>
  );
}
