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
        <p className="text-xs uppercase tracking-[0.2em] text-muted">Developer Workspace</p>
        <h1 className="text-base font-semibold text-text sm:text-lg">JSON, APIs, and data pipelines in one console</h1>
      </div>
      <div className="ml-auto flex items-center gap-2 sm:gap-3">
        <button className="glass rounded-full border border-border px-4 py-2 text-xs uppercase tracking-[0.2em] text-secondary hover:border-accent hover:text-accent">
          <span aria-hidden="true">⌘</span> Ctrl + K
        </button>
        <button className="rounded-full bg-accent px-4 py-2 text-xs uppercase tracking-[0.2em] text-white hover:bg-accent-hover">
          <span aria-hidden="true">🚀</span> Launch Editor
        </button>
      </div>
    </motion.header>
  );
}
