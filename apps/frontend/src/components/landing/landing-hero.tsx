"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-6">
        <motion.div
          className="inline-flex items-center gap-3 rounded-full border border-blue-900/70 bg-blue-950/60 px-4 py-2 text-xs font-semibold uppercase tracking-[0.3em] text-slate-100 shadow-sm"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          Premium JSON Workspace
        </motion.div>
        <motion.h2
          className="text-4xl font-bold tracking-tight text-slate-100 lg:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.45, ease: "easeOut" }}
        >
          Build, validate, and ship JSON workflows with the power of VSCode,
          Postman, and DevTools.
        </motion.h2>
        <p className="max-w-2xl text-base text-slate-300 lg:text-lg">
          JSONDeck delivers an enterprise-grade command center for JSON
          manipulation, API testing, and data transformations. Designed for
          developer focus with instant context switching and high-performance
          tooling.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className="rounded-full border border-blue-500 bg-blue-600 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-500">
            Start Building
          </Link>
          <Link href="/api-tester" className="rounded-full border border-slate-700 bg-slate-900/70 px-6 py-3 text-xs font-semibold uppercase tracking-[0.25em] text-slate-100 shadow-sm transition hover:-translate-y-0.5 hover:bg-slate-800">
            View API Console
          </Link>
        </div>
        <div className="flex flex-wrap gap-3 text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          <Link href="/transform" className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 hover:bg-slate-800 hover:text-slate-100">
            Transform
          </Link>
          <Link href="/tools" className="rounded-full border border-slate-700 bg-slate-900/60 px-4 py-2 hover:bg-slate-800 hover:text-slate-100">
            Tools
          </Link>
        </div>

      </div>
      <motion.div
        className="flex flex-col gap-4 rounded-3xl border border-slate-800 bg-slate-900/60 p-6 backdrop-blur-md"
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: "easeOut", delay: 0.1 }}
      >
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.25em] text-slate-300">
          <span>Live Workspace</span>
          <span className="rounded-full border border-blue-500/40 bg-blue-500/20 px-2 py-0.5 text-blue-300">
            Connected
          </span>
        </div>
        <div className="rounded-2xl border border-slate-800 bg-slate-900/70 p-4 shadow-sm">
          <pre className="whitespace-pre-wrap text-xs text-slate-100">
{`{
  "pipeline": "transform",
  "status": "healthy",
  "latency": "24ms",
  "events": 1286
}`}
          </pre>
        </div>
        <div className="grid gap-3 text-sm text-slate-100">
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm">
            <span>Schema Validator</span>
            <span className="text-blue-300">Online</span>
          </div>
          <div className="flex items-center justify-between rounded-xl border border-slate-800 bg-slate-900/70 px-4 py-3 shadow-sm">
            <span>API Runner</span>
            <span className="text-blue-300">Ready</span>
          </div>
        </div>
      </motion.div>
    </section>
  );
}
