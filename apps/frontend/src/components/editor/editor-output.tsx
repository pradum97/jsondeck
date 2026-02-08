"use client";

import { JsonDiffLine } from "@/lib/json-tools";
import { useEditorStore } from "@/store/editor-store";
import { cn } from "@/lib/utils";

type EditorOutputProps = {
  formatted: string;
  diff: JsonDiffLine[];
};

export function EditorOutput({ formatted, diff }: EditorOutputProps) {
  const { diagnostics, diffView, output } = useEditorStore();
  const displayText = output || formatted;

  return (
    <div className="flex h-full flex-col gap-4 rounded-3xl border border-slate-800/70 bg-slate-950/70 p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
            Diagnostics
          </p>
          <p
            className={cn(
              "text-sm font-semibold",
              diagnostics.status === "valid"
                ? "text-emerald-300"
                : diagnostics.status === "error"
                ? "text-rose-300"
                : "text-slate-400"
            )}
          >
            {diagnostics.message}
          </p>
        </div>
        <span className="rounded-full border border-slate-800/80 px-3 py-1 text-[10px] text-slate-500">
          {diffView ? "Diff view" : "Preview"}
        </span>
      </div>
      <div className="flex-1 overflow-hidden rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3 text-xs text-slate-300">
        {diffView ? (
          <div className="h-full overflow-auto font-mono leading-relaxed">
            {diff.map((line, index) => (
              <div
                key={`${line.line}-${index}`}
                className={cn(
                  "whitespace-pre",
                  line.type === "added" && "text-emerald-300",
                  line.type === "removed" && "text-rose-300",
                  line.type === "same" && "text-slate-400"
                )}
              >
                <span className="mr-2 text-slate-600">
                  {line.type === "added"
                    ? "+"
                    : line.type === "removed"
                    ? "-"
                    : " "}
                </span>
                {line.line}
              </div>
            ))}
          </div>
        ) : (
          <pre className="h-full overflow-auto whitespace-pre-wrap font-mono leading-relaxed text-slate-300">
            {displayText}
          </pre>
        )}
      </div>
    </div>
  );
}
