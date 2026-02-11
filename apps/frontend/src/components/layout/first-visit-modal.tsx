"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const VISITED_KEY = "jsondeck.first-visit.v1";

export function FirstVisitModal() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const visited = localStorage.getItem(VISITED_KEY);
    if (!visited) {
      setOpen(true);
    }
  }, []);

  const closeModal = () => {
    localStorage.setItem(VISITED_KEY, "1");
    setOpen(false);
  };

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-4 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="w-full max-w-2xl rounded-3xl border border-cyan-500/30 bg-slate-950/90 p-8 text-slate-100 shadow-[0_30px_100px_rgba(14,116,144,0.5)]"
            initial={{ opacity: 0, y: 24, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 24, scale: 0.98 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
          >
            <p className="text-xs font-semibold uppercase tracking-[0.34em] text-cyan-200">Welcome to JSONDeck</p>
            <h2 className="mt-3 text-3xl font-semibold text-white">Your premium JSON workspace is ready.</h2>
            <ul className="mt-5 grid gap-2 text-sm text-slate-300 md:grid-cols-2">
              <li>• Monaco-powered multi-tab editor</li>
              <li>• Built-in API tester and JSON tools</li>
              <li>• Rich transforms and structured output</li>
              <li>• Adaptive keyboard-first workflow</li>
            </ul>
            <div className="mt-7 flex justify-end">
              <Button type="button" onClick={closeModal} className="min-w-28">
                Start Building
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
