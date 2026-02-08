"use client";

import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <motion.div
          className="inline-flex items-center gap-3 rounded-full border border-emerald-400/40 bg-emerald-400/10 px-4 py-2 text-xs uppercase tracking-[0.3em] text-emerald-200"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Premium JSON Workspace
        </motion.div>
        <motion.h2
          className="text-4xl font-semibold tracking-tight text-slate-100 lg:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Build, validate, and ship JSON workflows with the power of VSCode,
          Postman, and DevTools.
        </motion.h2>
        <p className="text-base text-slate-300 lg:text-lg">
          JSONDeck delivers an enterprise-grade command center for JSON
          manipulation, API testing, and data transformations. Designed for
          developer focus with instant context switching and high-performance
          tooling.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full bg-emerald-400/20 px-6 py-3 text-xs uppercase tracking-[0.25em] text-emerald-100 transition hover:bg-emerald-400/30">
            Start Building
          </button>
          <button className="glass rounded-full border border-slate-700/70 px-6 py-3 text-xs uppercase tracking-[0.25em] text-slate-200 transition hover:border-emerald-400/50">
            View API Console
          </button>
        </div>
      </div>
      <motion.div
        className="glass flex flex-col gap-4 rounded-3xl border border-slate-800/80 p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500">
          <span>Live Workspace</span>
          <span className="text-emerald-300">Connected</span>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-4">
          <pre className="whitespace-pre-wrap text-xs text-slate-300">
{`{
  "pipeline": "transform",
  "status": "healthy",
  "latency": "24ms",
  "events": 1286
}`}
          </pre>
        </div>
        <div className="grid gap-3 text-sm text-slate-300">
          <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3">
            <span>Schema Validator</span>
            <span className="text-emerald-300">Online</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800/70 bg-slate-950/60 px-4 py-3">
            <span>API Runner</span>
            <span className="text-emerald-300">Ready</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
