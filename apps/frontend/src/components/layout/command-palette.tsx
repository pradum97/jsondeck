"use client";

import { cn } from "@/lib/utils";
import { motion, AnimatePresence } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import { useMemo, useState } from "react";

type Command = {
  title: string;
  description: string;
  shortcut: string;
};

const commands: Command[] = [
  {
    title: "Open Editor",
    description: "Jump into the JSON editor workspace.",
    shortcut: "E",
  },
  {
    title: "Run API Test",
    description: "Launch the Postman-style request runner.",
    shortcut: "A",
  },
  {
    title: "Transform JSON",
    description: "Generate types and payloads instantly.",
    shortcut: "T",
  },
  {
    title: "Open Settings",
    description: "Customize themes, roles, and integrations.",
    shortcut: "S",
  },
];

export function CommandPalette() {
  const [open, setOpen] = useState(false);
  const listedCommands = useMemo(() => commands, []);

  useHotkeys(
    "ctrl+k,meta+k",
    (event) => {
      event.preventDefault();
      setOpen((prev) => !prev);
    },
    { enableOnFormTags: true }
  );

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/70 p-6 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            className="glass w-full max-w-2xl rounded-3xl border border-slate-700/80 p-6"
            initial={{ scale: 0.96, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.98, opacity: 0 }}
            transition={{ duration: 0.2, ease: "easeOut" }}
          >
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-slate-500">
                  Command Palette
                </p>
                <h2 className="text-lg font-semibold text-slate-100">
                  Navigate JSONDeck
                </h2>
              </div>
              <button
                className="rounded-full border border-slate-700/80 px-3 py-1 text-xs text-slate-300"
                onClick={() => setOpen(false)}
                type="button"
              >
                Esc
              </button>
            </div>
            <div className="mt-6 grid gap-3">
              {listedCommands.map((command) => (
                <div
                  key={command.title}
                  className={cn(
                    "flex items-center justify-between rounded-2xl border border-slate-800/80 bg-slate-900/60 px-4 py-3",
                    "transition hover:border-emerald-400/60"
                  )}
                >
                  <div>
                    <p className="text-sm font-medium text-slate-100">
                      {command.title}
                    </p>
                    <p className="text-xs text-slate-400">
                      {command.description}
                    </p>
                  </div>
                  <span className="rounded-full border border-slate-700/80 bg-slate-950/60 px-2 py-1 text-[10px] uppercase tracking-[0.2em] text-slate-300">
                    {command.shortcut}
                  </span>
                </div>
              ))}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  );
}
