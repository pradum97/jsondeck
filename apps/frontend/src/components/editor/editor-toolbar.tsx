"use client";

import { motion } from "framer-motion";
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
        "flex h-11 items-center gap-2 rounded-2xl border px-4 text-xs font-semibold uppercase tracking-[0.18em] transition",
        variant === "primary"
          ? "border-cyan-400/70 bg-cyan-500/20 text-cyan-100 shadow-[0_0_18px_rgba(34,211,238,0.35)]"
          : "border-slate-700/80 bg-slate-900/60 text-slate-200 hover:border-slate-500"
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
  onPaste: () => void;
  onClear: () => void;
  onCopy: () => void;
  onStringify: () => void;
  onLoadJson: () => void;
  onNewTab: () => void;
};

export function EditorToolbar({
  onFormat,
  onMinify,
  onPaste,
  onClear,
  onCopy,
  onStringify,
  onLoadJson,
  onNewTab,
}: EditorToolbarProps) {
  return (
    <div className="flex flex-wrap items-center gap-2 md:gap-3">
      <ToolbarButton label="Format" onClick={onFormat} shortcut="Ctrl⇧F" variant="primary" />
      <ToolbarButton label="Minify" onClick={onMinify} shortcut="Ctrl⇧M" />
      <ToolbarButton label="Paste" onClick={onPaste} />
      <ToolbarButton label="Clear" onClick={onClear} />
      <ToolbarButton label="Copy" onClick={onCopy} />
      <ToolbarButton label="Stringify" onClick={onStringify} />
      <ToolbarButton label="Load JSON" onClick={onLoadJson} />
      <ToolbarButton label="New Tab" onClick={onNewTab} shortcut="Ctrl⌥N" />
    </div>
  );
}
