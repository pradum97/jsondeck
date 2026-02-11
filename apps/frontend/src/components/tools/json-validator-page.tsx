"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";

const MonacoEditor = dynamic(() => import("@monaco-editor/react"), { ssr: false });

type ValidationIssue = {
  line: number;
  column: number;
  message: string;
};

function parseError(input: string): ValidationIssue[] {
  try {
    JSON.parse(input);
    return [];
  } catch (error) {
    if (!(error instanceof Error)) {
      return [{ line: 1, column: 1, message: "Invalid JSON." }];
    }

    const positionMatch = error.message.match(/position\s(\d+)/i);
    const position = positionMatch ? Number(positionMatch[1]) : 0;
    const before = input.slice(0, position);
    const line = before.split("\n").length;
    const column = before.length - before.lastIndexOf("\n");
    return [{ line, column, message: error.message }];
  }
}

export function JsonValidatorPage() {
  const [value, setValue] = useState("{\n  \"workspace\": \"jsondeck\"\n}");
  const [result, setResult] = useState("Ready to validate JSON.");
  const issues = useMemo(() => parseError(value), [value]);
  const monacoRef = useRef<import("monaco-editor").editor.IStandaloneCodeEditor | null>(null);
  const monacoApiRef = useRef<typeof import("monaco-editor") | null>(null);

  useEffect(() => {
    const editor = monacoRef.current;
    const monaco = monacoApiRef.current;
    if (!editor || !monaco) return;
    const model = editor.getModel();
    if (!model) return;

    monaco.editor.setModelMarkers(
      model,
      "json-validator",
      issues.map((issue) => ({
        startLineNumber: issue.line,
        startColumn: issue.column,
        endLineNumber: issue.line,
        endColumn: issue.column + 1,
        message: issue.message,
        severity: monaco.MarkerSeverity.Error,
      }))
    );
  }, [issues]);

  const validate = () => {
    if (issues.length === 0) {
      setResult("JSON is valid.");
      return;
    }
    setResult("JSON has validation errors.");
  };

  const format = () => {
    try {
      setValue(JSON.stringify(JSON.parse(value) as unknown, null, 2));
      setResult("JSON formatted.");
    } catch {
      setResult("Unable to format invalid JSON.");
    }
  };

  return (
    <main className="flex h-full flex-col gap-4">
      <div className="flex flex-wrap items-center gap-2">
        <button type="button" onClick={validate} className="h-10 rounded-xl bg-cyan-500/25 px-4 text-xs uppercase tracking-[0.2em] text-cyan-100">Validate JSON</button>
        <button type="button" onClick={format} className="h-10 rounded-xl border border-slate-700 px-4 text-xs uppercase tracking-[0.2em] text-slate-200">Format</button>
        <button type="button" onClick={() => void navigator.clipboard.writeText(result)} className="h-10 rounded-xl border border-slate-700 px-4 text-xs uppercase tracking-[0.2em] text-slate-200">Copy Result</button>
        <span className="text-sm text-slate-300">{result}</span>
      </div>

      <div className="h-[62vh] min-h-[360px] overflow-hidden rounded-2xl border border-slate-800/70">
        <MonacoEditor
          height="100%"
          defaultLanguage="json"
          theme="vs-dark"
          value={value}
          onChange={(nextValue) => setValue(nextValue ?? "")}
          options={{ minimap: { enabled: false }, automaticLayout: true, scrollBeyondLastLine: false }}
          onMount={(editor, monaco) => {
            monacoRef.current = editor;
            monacoApiRef.current = monaco;
          }}
        />
      </div>

      <div className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-500">Error list</p>
        <ul className="mt-2 space-y-1 text-sm text-rose-300">
          {issues.length === 0 ? <li className="text-emerald-300">No errors found.</li> : issues.map((issue) => (
            <li key={`${issue.line}-${issue.column}`}>Line {issue.line}, Col {issue.column}: {issue.message}</li>
          ))}
        </ul>
      </div>
    </main>
  );
}
