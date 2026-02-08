"use client";

import { cn } from "@/lib/utils";
import { motion } from "framer-motion";
import Link from "next/link";

const navItems = [
  { label: "Workspace", href: "/" },
  { label: "Editor", href: "/editor" },
  { label: "Transform", href: "/transform" },
  { label: "Tools", href: "/tools" },
  { label: "API Tester", href: "/api-tester" },
  { label: "Dashboard", href: "/dashboard" },
];

export function Sidebar() {
  return (
    <motion.aside
      className={cn(
        "glass flex min-h-screen w-64 flex-col gap-6 border-r border-slate-800/80 p-6",
        "bg-gradient-to-b from-slate-950/80 via-slate-950/60 to-slate-900/70"
      )}
      initial={{ x: -24, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
    >
      <div className="flex items-center justify-between">
        <div className="flex flex-col">
          <span className="text-xs uppercase tracking-[0.3em] text-emerald-300/80">
            JSONDeck
          </span>
          <span className="text-sm text-slate-400">jsondeck.dev</span>
        </div>
        <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-emerald-200">
          Pro
        </span>
      </div>
      <nav className="flex flex-1 flex-col gap-2">
        {navItems.map((item) => (
          <Link
            key={item.href}
            href={item.href}
            className="group flex items-center justify-between rounded-xl border border-transparent px-4 py-3 text-sm text-slate-200 transition hover:border-slate-700/70 hover:bg-slate-900/60"
          >
            <span>{item.label}</span>
            <span className="text-xs text-slate-500 opacity-0 transition group-hover:opacity-100">
              ↗
            </span>
          </Link>
        ))}
      </nav>
      <div className="space-y-3 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">System</p>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Latency</span>
          <span className="text-emerald-300">24ms</span>
        </div>
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>Region</span>
          <span>us-east</span>
        </div>
      </div>
    </motion.aside>
  );
}
