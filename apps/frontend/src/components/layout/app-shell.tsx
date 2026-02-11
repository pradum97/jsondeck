"use client";

import { useEffect } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Navbar } from "@/components/layout/navbar";
import { FirstVisitModal } from "@/components/layout/first-visit-modal";
import { motion } from "framer-motion";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // Ignore registration errors; offline support is best-effort.
    });
  }, []);

  return (
    <div className="relative min-h-screen overflow-x-clip bg-bg text-text">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top,_color-mix(in_srgb,var(--accent)_9%,transparent),_transparent_52%)]" />
      <div className="relative z-10 flex min-h-screen flex-col">
        <Navbar />
        <motion.section
          className="glass relative mx-2 mb-2 mt-1 flex min-h-0 flex-1 flex-col rounded-xl border border-border bg-section p-2 shadow-md sm:mx-3 sm:mb-3 sm:p-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, ease: "easeOut" }}
        >
          <div className="relative z-10 flex h-full min-h-0 flex-1 flex-col">{children}</div>
        </motion.section>
      </div>
      <FirstVisitModal />
      <CommandPalette />
    </div>
  );
}
