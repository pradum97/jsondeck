"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-6 rounded-2xl border border-[color:var(--border)] bg-[color:var(--surface)] p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <motion.p
          className="inline-flex items-center rounded-full bg-[color:var(--accent-soft)] px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-[color:var(--text)]"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Premium JSON Workspace
        </motion.p>
        <motion.h1
          className="text-3xl font-bold tracking-tight text-[color:var(--text)] sm:text-4xl lg:text-5xl"
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
        >
          Build, validate, and ship JSON workflows with VSCode speed and Postman clarity.
        </motion.h1>
        <p className="max-w-2xl text-base text-[color:var(--muted)] sm:text-lg">
          JSONDeck delivers a production-ready command center for JSON editing, transformation, and API testing with clean theming and full-height workspaces.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className="rounded-xl bg-[color:var(--accent)] px-5 py-3 text-sm font-semibold text-[color:var(--surface)] hover:bg-[color:var(--accent-hover)]">Start Building</Link>
          <Link href="/transform" className="rounded-xl border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]">Transform</Link>
          <Link href="/tools" className="rounded-xl border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]">Tools</Link>
          <Link href="/api-tester" className="rounded-xl border border-[color:var(--border)] px-5 py-3 text-sm font-semibold text-[color:var(--text)] hover:bg-[color:var(--accent-soft)]">API Tester</Link>
        </div>
      </div>

      <motion.div className="space-y-3 rounded-2xl border border-[color:var(--border)] bg-[color:var(--bg)] p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-[color:var(--muted)]">
          <span>Live Workspace</span>
          <span className="rounded-full bg-[color:var(--accent-soft)] px-2 py-1 text-[color:var(--text)]">Connected</span>
        </div>
        <pre className="rounded-xl border border-[color:var(--border)] bg-[color:var(--surface)] p-3 text-xs text-[color:var(--text)]">
{`{
  "pipeline": "transform",
  "status": "healthy",
  "latency": "24ms",
  "events": 1286
}`}
        </pre>
      </motion.div>
    </section>
  );
}
