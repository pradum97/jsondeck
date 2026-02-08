"use client";

import { motion } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

export function EditorTabs() {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  return (
    <div className="flex items-center gap-2 overflow-x-auto pb-2">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "group relative flex items-center gap-2 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.18em] transition",
            activeTabId === tab.id
              ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
              : "border-slate-800/80 bg-slate-900/40 text-slate-400 hover:text-slate-200"
          )}
        >
          <span>{tab.name}</span>
          {tab.isDirty ? (
            <span className="h-2 w-2 rounded-full bg-amber-400 shadow-[0_0_10px_rgba(251,191,36,0.8)]" />
          ) : null}
          <span
            onClick={(event) => {
              event.stopPropagation();
              closeTab(tab.id);
            }}
            className="ml-2 text-[10px] text-slate-500 transition group-hover:text-slate-200"
          >
            ✕
          </span>
        </motion.button>
      ))}
    </div>
  );
}
