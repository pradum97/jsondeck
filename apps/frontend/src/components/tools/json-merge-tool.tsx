"use client";

import { useEffect, useRef } from "react";
import { create } from "zustand";
import { ToolCard } from "@/components/tools/tool-card";

type MergeStatus = "idle" | "loading" | "success" | "error";

type JsonMergeState = {
  leftInput: string;
  rightInput: string;
  output: string;
  status: MergeStatus;
  message: string;
  setLeftInput: (value: string) => void;
  setRightInput: (value: string) => void;
  setOutput: (value: string) => void;
  setStatus: (value: MergeStatus) => void;
  setMessage: (value: string) => void;
};

const useJsonMergeStore = create<JsonMergeState>((set) => ({
  leftInput: "",
  rightInput: "",
  output: "",
  status: "idle",
  message: "Ready",
  setLeftInput: (value) => set({ leftInput: value }),
  setRightInput: (value) => set({ rightInput: value }),
  setOutput: (value) => set({ output: value }),
  setStatus: (value) => set({ status: value }),
  setMessage: (value) => set({ message: value }),
}));

type MergeWorkerResponse =
  | { status: "success"; output: string }
  | { status: "error"; message: string };

export function JsonMergeTool() {
  const leftInput = useJsonMergeStore((state) => state.leftInput);
  const rightInput = useJsonMergeStore((state) => state.rightInput);
  const output = useJsonMergeStore((state) => state.output);
  const status = useJsonMergeStore((state) => state.status);
  const message = useJsonMergeStore((state) => state.message);
  const setLeftInput = useJsonMergeStore((state) => state.setLeftInput);
  const setRightInput = useJsonMergeStore((state) => state.setRightInput);
  const setOutput = useJsonMergeStore((state) => state.setOutput);
  const setStatus = useJsonMergeStore((state) => state.setStatus);
  const setMessage = useJsonMergeStore((state) => state.setMessage);
  const workerRef = useRef<Worker | null>(null);

  useEffect(() => {
    const worker = new Worker(
      new URL("@/workers/json-merge.worker.ts", import.meta.url)
    );
    worker.onmessage = (event: MessageEvent<MergeWorkerResponse>) => {
      if (event.data.status === "success") {
        setOutput(event.data.output);
        setStatus("success");
        setMessage("Merged successfully.");
      } else {
        setOutput("");
        setStatus("error");
        setMessage(event.data.message);
      }
    };
    workerRef.current = worker;
    return () => {
      worker.terminate();
      workerRef.current = null;
    };
  }, [setMessage, setOutput, setStatus]);

  const handleMerge = () => {
    if (!workerRef.current) return;
    setStatus("loading");
    setMessage("Merging...");
    workerRef.current.postMessage({ left: leftInput, right: rightInput });
  };

  return (
    <ToolCard
      title="JSON Merge"
      description="Combine two JSON payloads without blocking the UI thread."
    >
      <div className="grid gap-4">
        <div className="grid gap-3 lg:grid-cols-2">
          <textarea
            value={leftInput}
            onChange={(event) => setLeftInput(event.target.value)}
            placeholder="Left JSON"
            className="min-h-[140px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
          />
          <textarea
            value={rightInput}
            onChange={(event) => setRightInput(event.target.value)}
            placeholder="Right JSON"
            className="min-h-[140px] w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 p-4 text-sm text-slate-200 placeholder:text-slate-500"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <button
            type="button"
            onClick={handleMerge}
            className="rounded-full border border-cyan-400/60 bg-cyan-500/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-cyan-200"
          >
            Merge JSON
          </button>
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            {status === "loading" ? "Working" : message}
          </p>
        </div>
        <div className="rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4">
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">Output</p>
          <pre className="mt-2 max-h-48 overflow-auto text-xs text-slate-200">
            {output || "Merged JSON will appear here."}
          </pre>
        </div>
      </div>
    </ToolCard>
  );
}
