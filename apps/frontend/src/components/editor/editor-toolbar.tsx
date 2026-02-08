"use client";

import { motion } from "framer-motion";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type ToolbarButtonProps = {
  label: string;
  onClick: () => void;
  shortcut?: string;
  variant?: "primary" | "secondary";
};

function ToolbarButton({
  label,
  onClick,
  shortcut,
  variant = "secondary",
}: ToolbarButtonProps) {
  return (
    <motion.button
      whileHover={{ y: -1 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={cn(
        "flex items-center gap-3 rounded-2xl border px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] transition",
        variant === "primary"
          ? "border-cyan-400/60 bg-cyan-500/10 text-cyan-200 shadow-[0_0_16px_rgba(34,211,238,0.35)]"
          : "border-slate-800/80 bg-slate-900/60 text-slate-200 hover:border-slate-700"
      )}
    >
      <span>{label}</span>
      {shortcut ? (
        <span className="rounded-full border border-slate-700/80 px-2 py-1 text-[10px] text-slate-400">
          {shortcut}
        </span>
      ) : null}
    </motion.button>
  );
}

type EditorToolbarProps = {
  onFormat: () => void;
  onMinify: () => void;
  onValidate: () => void;
  onNewTab: () => void;
};

export function EditorToolbar({
  onFormat,
  onMinify,
  onValidate,
  onNewTab,
}: EditorToolbarProps) {
  const { diffView, toggleDiffView } = useEditorStore();

  return (
    <div className="flex flex-wrap items-center gap-3">
      <ToolbarButton
        label="Format"
        onClick={onFormat}
        shortcut="Ctrl⇧F"
        variant="primary"
      />
      <ToolbarButton label="Minify" onClick={onMinify} shortcut="Ctrl⇧M" />
      <ToolbarButton label="Validate" onClick={onValidate} shortcut="Ctrl⇧V" />
      <ToolbarButton label="New Tab" onClick={onNewTab} shortcut="Ctrl⌥N" />
      <ToolbarButton
        label={diffView ? "Diff: On" : "Diff: Off"}
        onClick={toggleDiffView}
      />
    </div>
  );
}
