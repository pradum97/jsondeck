"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <motion.div
          className="inline-flex items-center gap-3 rounded-full border border-blue-200 bg-white px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-blue-600 shadow-sm dark:border-blue-900/70 dark:bg-blue-950/60 dark:text-slate-100"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Premium JSON Workspace
        </motion.div>
        <motion.h2
          className="text-4xl font-bold tracking-tight text-slate-900 lg:text-5xl dark:text-white"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Build, validate, and ship JSON workflows with the power of VSCode,
          Postman, and DevTools.
        </motion.h2>
        <p className="max-w-2xl text-base text-slate-700 lg:text-lg dark:text-slate-100/90">
          JSONDeck delivers an enterprise-grade command center for JSON
          manipulation, API testing, and data transformations. Designed for
          developer focus with instant context switching and high-performance
          tooling.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className="rounded-full border border-blue-600 bg-blue-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 dark:border-blue-500 dark:bg-blue-600 dark:text-slate-100 dark:hover:bg-blue-500">
            Start Building
          </Link>
          <Link href="/api-tester" className="rounded-full border border-slate-200 bg-white px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-700 shadow-sm transition hover:-translate-y-0.5 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/70 dark:text-slate-100 dark:hover:bg-slate-800">
            View API Console
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-500 dark:text-slate-300">
          <Link href="/transform" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            Transform
          </Link>
          <Link href="/tools" className="rounded-full border border-slate-200 bg-white px-4 py-2 text-slate-700 hover:bg-white hover:text-slate-900 dark:border-slate-700 dark:bg-slate-900/60 dark:text-slate-300 dark:hover:bg-slate-800 dark:hover:text-slate-100">
            Tools
          </Link>
        </div>
      </div>
      <motion.div
        className="flex flex-col gap-4 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm dark:border-slate-800 dark:bg-slate-900/60 dark:backdrop-blur-md"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-500 dark:text-slate-300">
          <span>Live Workspace</span>
          <span className="rounded-full border border-blue-200 bg-white px-2 py-0.5 text-blue-600 dark:border-blue-500/40 dark:bg-blue-500/20 dark:text-blue-300">
            Connected
          </span>
        </div>
        <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
          <pre className="whitespace-pre-wrap text-xs text-slate-900 dark:text-slate-100">
{`{
  "pipeline": "transform",
  "status": "healthy",
  "latency": "24ms",
  "events": 1286
}`}
          </pre>
        </div>
        <div className="grid gap-3 text-sm text-slate-900 dark:text-slate-100">
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <span>Schema Validator</span>
            <span className="text-blue-600 dark:text-blue-300">Online</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-slate-900/70">
            <span>API Runner</span>
            <span className="text-blue-600 dark:text-blue-300">Ready</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
