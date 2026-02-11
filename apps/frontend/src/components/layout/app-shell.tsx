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
            "glass relative mx-2 mb-2 mt-1 flex-1 rounded-2xl border border-slate-800/65 p-2 shadow-2xl sm:mx-3 sm:mb-3 sm:p-3",
            "before:pointer-events-none before:absolute before:inset-0 before:rounded-2xl before:bg-gradient-to-br before:from-slate-900/45 before:to-slate-950/25 before:content-['']"
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
