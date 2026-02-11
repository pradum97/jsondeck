"use client";

import { useEffect } from "react";
import { CommandPalette } from "@/components/layout/command-palette";
import { Navbar } from "@/components/layout/navbar";
import { FirstVisitModal } from "@/components/layout/first-visit-modal";
import { Footer } from "@/components/layout/footer";

export function AppShell({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/service-worker.js").catch(() => {
      // best effort
    });
  }, []);

  return (
    <div className="min-h-screen bg-[color:var(--bg)] text-[color:var(--text)]">
      <div className="flex min-h-screen flex-col">
        <Navbar />
        <main className="mx-auto flex w-full max-w-7xl min-h-0 flex-1 flex-col px-2 pb-3 pt-2 sm:px-4">
          {children}
        </main>
        <Footer />
      </div>
      <FirstVisitModal />
      <CommandPalette />
    </div>
  );
}
