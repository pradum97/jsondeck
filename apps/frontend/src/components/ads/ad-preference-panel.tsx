"use client";

import { useState } from "react";
import { motion } from "framer-motion";

interface AdPreferencePanelProps {
  initialEnabled: boolean;
  adProfile: string;
}

export function AdPreferencePanel({ initialEnabled, adProfile }: AdPreferencePanelProps) {
  const [adsEnabled, setAdsEnabled] = useState(initialEnabled);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-300/70">Ads</p>
        <h2 className="text-2xl font-semibold text-white">Sponsored surfaces</h2>
        <p className="text-sm text-slate-300">Control ads across the workspace and surface only trusted partners.</p>
      </header>
      <motion.div
        className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-6 shadow-sm"
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
      >
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-lg font-semibold text-white">Ads enabled</p>
            <p className="text-sm text-slate-400">Profile: {adProfile}</p>
          </div>
          <button
            className={
              adsEnabled
                ? "rounded-full border border-emerald-500/60 bg-emerald-500/10 px-4 py-2 text-sm font-semibold text-emerald-200"
                : "rounded-full border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200"
            }
            type="button"
            onClick={() => setAdsEnabled((prev) => !prev)}
          >
            {adsEnabled ? "Enabled" : "Disabled"}
          </button>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-3">
          {[
            "Contextual dev tools",
            "Workflow automation",
            "Trusted infrastructure",
          ].map((slot) => (
            <div
              key={slot}
              className="rounded-xl border border-slate-800/80 bg-slate-900/60 p-4"
            >
              <p className="text-sm font-semibold text-white">{slot}</p>
              <p className="text-xs text-slate-400">Curated placements for enterprise partners.</p>
            </div>
          ))}
        </div>
      </motion.div>
    </section>
  );
}
