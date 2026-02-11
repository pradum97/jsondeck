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
    <div className="flex items-center gap-1.5 overflow-x-auto">
      {tabs.map((tab) => (
        <motion.button
          key={tab.id}
          layout
          onClick={() => setActiveTab(tab.id)}
          className={cn(
            "group relative flex h-7 items-center gap-1.5 rounded-md border px-2.5 text-[11px] font-medium transition",
            activeTabId === tab.id
              ? "border-accent bg-accent-soft text-accent shadow-sm"
              : "border-border bg-section text-secondary hover:text-text"
          )}
        >
          <span className="truncate">{tab.name}</span>
          {tab.isDirty ? (
            <span className="h-1.5 w-1.5 rounded-full bg-warning shadow-sm" />
          ) : null}
          <span
            onClick={(event) => {
              event.stopPropagation();
              closeTab(tab.id);
            }}
            className="ml-1 text-[10px] text-muted transition group-hover:text-secondary"
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
        className="inline-flex h-7 w-7 shrink-0 items-center justify-center rounded-md border border-border bg-section text-secondary transition hover:border-accent hover:text-accent"
        aria-label="Add tab"
      >
        <span className="text-base leading-none">+</span>
      </motion.button>
    </div>
  );
}
