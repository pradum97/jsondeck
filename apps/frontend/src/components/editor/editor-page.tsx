"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { useHotkeys } from "react-hotkeys-hook";
import {
  buildLineDiff,
  formatJson,
  minifyJson,
  validateJson,
} from "@/lib/json-tools";
import { requestTransform, type TransformOperation } from "@/lib/transform-service";
import { useEditorStore } from "@/store/editor-store";
import { EditorTabs } from "@/components/editor/editor-tabs";
import { EditorToolbar } from "@/components/editor/editor-toolbar";
import { EditorOutput } from "@/components/editor/editor-output";
import { EditorSnippets } from "@/components/editor/editor-snippets";
import { EditorHistory } from "@/components/editor/editor-history";
import { ResizableSplit } from "@/components/editor/resizable-split";
import { MonacoEditor } from "@/components/editor/monaco-editor";
import { cn } from "@/lib/utils";

const STORAGE_KEY = "jsondeck.editor.tabs.v1";
const REMOTE_TRANSFORM_THRESHOLD = 1200;

export function EditorPage() {
  const {
    tabs,
    activeTabId,
    updateTabContent,
    addTab,
    setDiagnostics,
    setOutput,
    addHistory,
    splitRatio,
    setSplitRatio,
    hydrate,
    markSaved,
  } = useEditorStore();
  const activeTab = tabs.find((tab) => tab.id === activeTabId) ?? tabs[0];
  const [lastSavedLabel, setLastSavedLabel] = useState("Autosave idle");

  const formattedPreview = useMemo(
    () => formatJson(activeTab.content),
    [activeTab.content]
  );

  const diff = useMemo(
    () => buildLineDiff(activeTab.content, formattedPreview.value),
    [activeTab.content, formattedPreview.value]
  );

  const runTransform = async (operation: TransformOperation) => {
    const runLocalTransform = () => {
      if (operation === "validate") {
        const result = validateJson(activeTab.content);
        setDiagnostics(result);
        return { status: result.status, value: "", message: result.message };
      }
      const result =
        operation === "minify"
          ? minifyJson(activeTab.content)
          : formatJson(activeTab.content);
      setDiagnostics(result.diagnostic);
      setOutput(result.value);
      if (result.diagnostic.status === "valid") {
        updateTabContent(activeTab.id, result.value);
      }
      return {
        status: result.diagnostic.status,
        value: result.value,
        message: result.diagnostic.message,
      };
    };

    if (activeTab.content.length < REMOTE_TRANSFORM_THRESHOLD) {
      return runLocalTransform();
    }

    try {
      const remote = await requestTransform(activeTab.content, operation);
      const diagnostics = {
        status: remote.status === "valid" ? "valid" : "error",
        message: remote.message,
      };
      setDiagnostics(diagnostics);
      setOutput(remote.output);
      if (remote.status === "valid" && operation !== "validate") {
        updateTabContent(activeTab.id, remote.output);
      }
      return { status: diagnostics.status, value: remote.output, message: remote.message };
    } catch {
      return runLocalTransform();
    }
  };

  const handleFormat = async () => {
    const result = await runTransform("format");
    addHistory({
      action: "Format",
      timestamp: new Date().toLocaleTimeString(),
      summary:
        result.status === "valid"
          ? "Formatted JSON successfully."
          : "Formatting failed due to invalid JSON.",
    });
  };

  const handleMinify = async () => {
    const result = await runTransform("minify");
    addHistory({
      action: "Minify",
      timestamp: new Date().toLocaleTimeString(),
      summary:
        result.status === "valid"
          ? "Minified JSON successfully."
          : "Minify failed due to invalid JSON.",
    });
  };

  const handleValidate = async () => {
    const result = await runTransform("validate");
    addHistory({
      action: "Validate",
      timestamp: new Date().toLocaleTimeString(),
      summary:
        result.status === "valid"
          ? "Validation passed."
          : "Validation failed with errors.",
    });
  };

  const handleNewTab = () => {
    addTab();
    addHistory({
      action: "New Tab",
      timestamp: new Date().toLocaleTimeString(),
      summary: "Opened a fresh JSON workspace tab.",
    });
  };

  useHotkeys("ctrl+shift+f", handleFormat, { preventDefault: true }, [
    activeTab.content,
  ]);
  useHotkeys("ctrl+shift+m", handleMinify, { preventDefault: true }, [
    activeTab.content,
  ]);
  useHotkeys("ctrl+shift+v", handleValidate, { preventDefault: true }, [
    activeTab.content,
  ]);
  useHotkeys("ctrl+alt+n", handleNewTab, { preventDefault: true }, []);

  useEffect(() => {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as {
        tabs: typeof tabs;
        activeTabId: string;
      };
      if (parsed.tabs?.length) {
        hydrate(parsed.tabs, parsed.activeTabId ?? parsed.tabs[0].id);
      }
    } catch {
      // Ignore storage errors.
    }
  }, [hydrate]);

  useEffect(() => {
    const timeout = window.setTimeout(() => {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ tabs, activeTabId })
      );
      const timestamp = new Date().toLocaleTimeString();
      markSaved(activeTabId, timestamp);
      setLastSavedLabel(`Autosaved at ${timestamp}`);
    }, 900);

    return () => {
      window.clearTimeout(timeout);
    };
  }, [tabs, activeTabId, markSaved]);

  const stats = useMemo(() => {
    const lines = activeTab.content.split("\n").length;
    const characters = activeTab.content.length;
    return { lines, characters };
  }, [activeTab.content]);

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-[0.32em] text-cyan-200">
            JSON Editor
          </p>
          <h1 className="text-3xl font-semibold text-white">
            Real-time JSON workspace
          </h1>
          <p className="text-sm text-slate-400">
            Format, lint, validate, diff, and ship production JSON faster.
          </p>
        </div>
        <motion.div
          className="rounded-3xl border border-slate-800/70 bg-slate-950/60 px-6 py-4 text-sm text-slate-300 shadow-lg"
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
        >
          <p className="text-xs uppercase tracking-[0.28em] text-slate-500">
            Workspace
          </p>
          <p className="text-lg font-semibold text-white">
            {activeTab.name}
          </p>
          <p className="text-xs text-slate-500">{lastSavedLabel}</p>
        </motion.div>
      </div>

      <EditorToolbar
        onFormat={handleFormat}
        onMinify={handleMinify}
        onValidate={handleValidate}
        onNewTab={handleNewTab}
      />

      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-4">
        <EditorTabs />
        <div className="mt-4 h-[520px] rounded-3xl border border-slate-800/70 bg-slate-950/70 p-3">
          <ResizableSplit
            initialRatio={splitRatio}
            onRatioChange={setSplitRatio}
            left={
              <div className="flex h-full flex-col gap-3 pr-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>Editor</span>
                  <span>
                    {stats.lines} lines · {stats.characters} chars
                  </span>
                </div>
                <div className="h-full">
                  <MonacoEditor
                    value={activeTab.content}
                    onChange={(nextValue) =>
                      updateTabContent(activeTab.id, nextValue)
                    }
                  />
                </div>
              </div>
            }
            right={
              <div className="flex h-full flex-col gap-3 pl-2">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.3em] text-slate-500">
                  <span>Output</span>
                  <span className={cn("text-cyan-300")}>
                    {formattedPreview.diagnostic.status === "valid"
                      ? "Ready"
                      : "Needs attention"}
                  </span>
                </div>
                <EditorOutput
                  formatted={formattedPreview.value}
                  diff={diff}
                />
              </div>
            }
          />
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <EditorSnippets
          onInsert={(payload) => updateTabContent(activeTab.id, payload)}
        />
        <EditorHistory />
      </div>
    </div>
  );
}
