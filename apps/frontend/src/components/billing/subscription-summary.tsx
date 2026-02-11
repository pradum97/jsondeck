"use client";

import { motion } from "framer-motion";

interface SubscriptionSummaryProps {
  planName: string;
  renewsOn: string;
  seats: number;
}

export function SubscriptionSummary({ planName, renewsOn, seats }: SubscriptionSummaryProps) {
  return (
    <motion.div
      className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-sm"
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="space-y-3">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-300/70">Current plan</p>
        <div>
          <h3 className="text-2xl font-semibold text-white">{planName}</h3>
          <p className="text-sm text-slate-400">Renews on {renewsOn}</p>
        </div>
        <div className="flex items-center justify-between rounded-xl border border-slate-800/80 bg-slate-900/60 p-4">
          <div>
            <p className="text-sm text-slate-400">Licensed seats</p>
            <p className="text-lg font-semibold text-white">{seats}</p>
          </div>
          <button
            className="rounded-xl border border-slate-700/70 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-400/60"
            type="button"
          >
            Manage billing
          </button>
        </div>
      </div>
    </motion.div>
  );
}
