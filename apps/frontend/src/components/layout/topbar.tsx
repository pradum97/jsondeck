"use client";

import { motion } from "framer-motion";

export function Topbar() {
  return (
    <motion.header
      className="flex items-center justify-between px-6 py-5"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Developer Workspace
        </p>
        <h1 className="text-lg font-semibold text-slate-100">
          JSON, APIs, and data pipelines in one console
        </h1>
      </div>
      <div className="flex items-center gap-3">
        <button className="glass rounded-full border border-slate-700/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200">
          Ctrl + K
        </button>
        <button className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/30">
          Launch Editor
        </button>
      </div>
    </motion.header>
  );
}
