"use client";

import { useEffect } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Navbar } from "@/components/layout/navbar";
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
    <div className="relative min-h-screen overflow-x-clip text-slate-100">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_center,_rgba(94,234,212,0.08),_transparent_55%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <motion.section
          className={cn(
            "glass relative mx-2 mb-2 mt-2 flex-1 rounded-3xl border border-slate-800/80 p-2 shadow-2xl sm:mx-4 sm:mb-4 sm:mt-3 sm:p-4",
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-3xl before:bg-gradient-to-br before:from-slate-900/60 before:to-slate-950/40"
          )}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative z-10 h-full">{children}</div>
        </motion.section>
      </div>
      <FirstVisitModal />
      <CommandPalette />
    </div>
  );
}
