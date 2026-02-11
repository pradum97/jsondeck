"use client";

import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <motion.div
          className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-blue-50 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-700 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Premium JSON Workspace
        </motion.div>
        <motion.h2
          className="text-4xl font-bold tracking-tight text-slate-900 dark:text-slate-50 lg:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Build, validate, and ship JSON workflows with the power of VSCode,
          Postman, and DevTools.
        </motion.h2>
        <p className="max-w-2xl text-base text-slate-600 dark:text-slate-300 lg:text-lg">
          JSONDeck delivers an enterprise-grade command center for JSON
          manipulation, API testing, and data transformations. Designed for
          developer focus with instant context switching and high-performance
          tooling.
        </p>
        <div className="flex flex-wrap gap-3">
          <button className="rounded-full border border-blue-600 bg-blue-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
            Start Building
          </button>
          <button className="rounded-full border border-slate-300 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-100 hover:shadow-md dark:border-slate-700 dark:bg-slate-900 dark:text-slate-100 dark:hover:bg-slate-800">
            View API Console
          </button>
        </div>
      </div>
      <motion.div
        className="premium-card flex flex-col gap-4 rounded-3xl p-6"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
          <span>Live Workspace</span>
          <span className="rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-blue-700 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-300">
            Connected
          </span>
        </div>
        <div className="rounded-2xl border border-slate-300 bg-white p-4 shadow-sm dark:border-slate-700 dark:bg-slate-950/80">
          <pre className="whitespace-pre-wrap text-xs text-slate-700 dark:text-slate-200">
{`{
  "pipeline": "transform",
  "status": "healthy",
  "latency": "24ms",
  "events": 1286
}`}
          </pre>
        </div>
        <div className="grid gap-3 text-sm text-slate-700 dark:text-slate-200">
          <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span>Schema Validator</span>
            <span className="text-blue-600 dark:text-blue-300">Online</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-300 bg-white px-4 py-3 shadow-sm dark:border-slate-700 dark:bg-slate-900">
            <span>API Runner</span>
            <span className="text-blue-600 dark:text-blue-300">Ready</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
