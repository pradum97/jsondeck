"use client";

import { motion } from "framer-motion";

export function Topbar() {
  return (
    <motion.header
      className="flex flex-wrap items-center justify-between gap-3 px-3 py-3 sm:px-6 sm:py-5"
      initial={{ y: -10, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.35, ease: "easeOut" }}
    >
      <div className="min-w-0 space-y-1">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">
          Developer Workspace
        </p>
        <h1 className="text-base font-semibold text-slate-100 sm:text-lg">
          JSON, APIs, and data pipelines in one console
        </h1>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button className="glass rounded-full border border-slate-700/80 px-4 py-2 text-xs uppercase tracking-[0.2em] text-slate-200 transition hover:border-emerald-400/60 hover:text-emerald-200">
          <span aria-hidden="true">⌘</span> Ctrl + K
        </button>
        <button className="rounded-full bg-emerald-400/20 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-200 transition hover:bg-emerald-400/30">
          <span aria-hidden="true">🚀</span> Launch Editor
        </button>
      </div>
    </motion.header>
  );
}
