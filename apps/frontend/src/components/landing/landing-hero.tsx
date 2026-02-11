"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export function LandingHero() {
  return (
    <section className="grid gap-6 rounded-2xl border border-border bg-card p-5 sm:p-8 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="space-y-5">
        <motion.p className="inline-flex items-center rounded-full bg-accent/10 px-3 py-1 text-xs font-semibold uppercase tracking-[0.24em] text-foreground" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          Premium JSON Workspace
        </motion.p>
        <motion.h1 className="text-3xl font-bold tracking-tight text-foreground dark:text-white sm:text-4xl lg:text-5xl" initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }}>
          Build, validate, and ship JSON workflows with VSCode speed and Postman clarity.
        </motion.h1>
        <p className="max-w-2xl text-base text-muted-foreground dark:text-slate-300 sm:text-lg">
          JSONDeck delivers a production-ready command center for JSON editing, transformation, and API testing with clean theming and full-height workspaces.
        </p>

        <div className="flex flex-wrap gap-3">
          <Link href="/editor" className="rounded-xl bg-[#2563eb] px-5 py-3 text-sm font-semibold text-white hover:bg-blue-700">Start Building</Link>
          <Link href="/api-tester" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent/10">View API Console</Link>
          <Link href="/transform" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent/10">Transform</Link>
          <Link href="/tools" className="rounded-xl border border-border px-5 py-3 text-sm font-semibold text-foreground hover:bg-accent/10">Tools</Link>
        </div>
      </div>

      <motion.div className="space-y-3 rounded-2xl border border-border bg-background p-4" initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}>
        <div className="flex items-center justify-between text-xs uppercase tracking-[0.2em] text-muted-foreground">
          <span>Live Workspace</span>
          <span className="rounded-full bg-accent/10 px-2 py-1 text-foreground">Connected</span>
        </div>
        <pre className="rounded-xl border border-border bg-card p-3 text-xs text-foreground">
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
