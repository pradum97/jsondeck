"use client";

import { motion } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type EditorTabsProps = {
  onAddTab: () => void;
};

export function EditorTabs({ onAddTab }: EditorTabsProps) {
  const { tabs, activeTabId, setActiveTab, closeTab } = useEditorStore();

  return (
    <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "group relative flex h-8 items-center gap-2 rounded-lg border px-3 text-[11px] font-medium transition",
            activeTabId === tab.id
              ? "border-cyan-400/65 bg-cyan-500/15 text-cyan-100 shadow-[0_0_16px_rgba(34,211,238,0.22)]"
              : "border-slate-700/80 bg-slate-900/55 text-slate-300 hover:text-slate-100"
          )}
        >
          <span className="truncate">{tab.name}</span>
          {tab.isDirty ? (
            <span className="h-1.5 w-1.5 rounded-full bg-amber-400 shadow-[0_0_8px_rgba(251,191,36,0.85)]" />
          ) : null}
          <span
            onClick={(event) => {
              event.stopPropagation();
              closeTab(tab.id);
            }}
            className="ml-1 text-[10px] text-slate-500 transition group-hover:text-slate-200"
          >
            ✕
          </span>
        </motion.button>
      ))}
      <motion.button
        type="button"
        whileHover={{ y: -1 }}
        whileTap={{ scale: 0.98 }}
        onClick={onAddTab}
        className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-slate-700/80 bg-slate-900/65 text-slate-200 transition hover:border-cyan-400/60 hover:text-cyan-100"
        aria-label="Add tab"
      >
        <span className="text-base leading-none">+</span>
      </motion.button>
    </div>
  );
}
