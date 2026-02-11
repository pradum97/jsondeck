"use client";

import { useEffect } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Navbar } from "@/components/layout/navbar";
import { Topbar } from "@/components/layout/topbar";
import { FirstVisitModal } from "@/components/layout/first-visit-modal";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // Ignore registration errors; offline support is best-effort.
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-hidden text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.08),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <Topbar />
        <motion.section
          className={cn(
            "glass relative m-4 flex-1 rounded-3xl border border-slate-800/80 p-6 shadow-2xl",
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-slate-900/60 before:to-slate-950/40"
          )}
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, ease: "easeOut" }}
        >
          <div className="relative z-10">{children}</div>
        </motion.section>
      </div>
      <FirstVisitModal />
      <CommandPalette />
    </div>
  );
}
