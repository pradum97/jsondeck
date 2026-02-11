"use client";

import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  return (
    <main className="flex min-h-[70vh] items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="glass w-full max-w-xl rounded-3xl border border-slate-700/70 p-8 text-center"
      >
        <p className="text-xs uppercase tracking-[0.3em] text-cyan-300">404</p>
        <h1 className="mt-2 text-4xl font-semibold text-slate-100">Page not found</h1>
        <p className="mt-3 text-sm text-slate-300">The route you requested is unavailable. Return to the editor workspace to continue your JSON flow.</p>
        <Link href="/" className="mt-6 inline-flex h-11 items-center rounded-xl bg-cyan-500/25 px-5 text-xs uppercase tracking-[0.2em] text-cyan-100">
          Go back
        </Link>
      </motion.div>
    </main>
  );
}
