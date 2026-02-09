"use client";

import { useEffect, useRef } from "react";
import { publicEnv } from "@/lib/public-env";

type MonacoEditorOptions = {
  value: string;
  language: string;
  theme: string;
  automaticLayout: boolean;
  fontSize: number;
  minimap: { enabled: boolean };
  lineNumbers: "on" | "off";
};

type MonacoDisposable = {
  dispose: () => void;
};

type MonacoModel = {
  getValue: () => string;
  setValue: (value: string) => void;
};

type MonacoEditorInstance = MonacoModel & {
  onDidChangeModelContent: (listener: () => void) => MonacoDisposable;
  layout: () => void;
  focus: () => void;
};

type Monaco = {
  editor: {
    create: (node: HTMLElement, options: MonacoEditorOptions) => MonacoEditorInstance;
    setTheme: (theme: string) => void;
  };
};

type RequireConfig = {
  paths: Record<string, string>;
};

type RequireFn = ((deps: string[], callback: () => void) => void) & {
  config: (config: RequireConfig) => void;
};

type MonacoEditorProps = {
  value: string;
  onChange: (value: string) => void;
};

const MONACO_CDN = publicEnv.monacoCdn;

let monacoPromise: Promise<Monaco> | null = null;

const loadMonaco = () => {
  if (monacoPromise) return monacoPromise;
  monacoPromise = new Promise<Monaco>((resolve, reject) => {
    const win = window as Window & { require?: RequireFn; monaco?: Monaco };
    if (win.monaco) {
      resolve(win.monaco);
      return;
    }
    if (!win.require) {
      const script = document.createElement("script");
      script.src = `${MONACO_CDN}/vs/loader.js`;
      script.async = true;
      script.onload = () => {
        if (!win.require) {
          reject(new Error("Monaco loader not available."));
          return;
        }
        win.require.config({ paths: { vs: `${MONACO_CDN}/vs` } });
        win.require(["vs/editor/editor.main"], () => {
          if (!win.monaco) {
            reject(new Error("Monaco failed to initialize."));
            return;
          }
          resolve(win.monaco);
        });
      };
      script.onerror = () => reject(new Error("Unable to load Monaco editor."));
      document.body.appendChild(script);
      return;
    }
    win.require.config({ paths: { vs: `${MONACO_CDN}/vs` } });
    win.require(["vs/editor/editor.main"], () => {
      if (!win.monaco) {
        reject(new Error("Monaco failed to initialize."));
        return;
      }
      resolve(win.monaco);
    });
  });
  return monacoPromise;
};

export function MonacoEditor({ value, onChange }: MonacoEditorProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const editorRef = useRef<MonacoEditorInstance | null>(null);
  const valueRef = useRef(value);

  useEffect(() => {
    let subscription: MonacoDisposable | null = null;
    let isMounted = true;

    loadMonaco()
      .then((monaco) => {
        if (!isMounted || !containerRef.current) return;
        monaco.editor.setTheme("vs-dark");
        const editor = monaco.editor.create(containerRef.current, {
          value: valueRef.current,
          language: "json",
          theme: "vs-dark",
          automaticLayout: true,
          fontSize: 14,
          minimap: { enabled: false },
          lineNumbers: "on",
        });
        editor.focus();
        subscription = editor.onDidChangeModelContent(() => {
          const nextValue = editor.getValue();
          valueRef.current = nextValue;
          onChange(nextValue);
        });
        editorRef.current = editor;
      })
      .catch(() => {
        // Monaco failed to load; fallback is handled by parent component.
      });

    return () => {
      isMounted = false;
      subscription?.dispose();
    };
  }, [onChange]);

  useEffect(() => {
    if (!editorRef.current) return;
    if (valueRef.current !== value) {
      editorRef.current.setValue(value);
      valueRef.current = value;
    }
  }, [value]);

  return (
    <div className="h-full w-full">
      <div
        ref={containerRef}
        className="h-full w-full rounded-2xl border border-slate-800/70 bg-slate-950/80 shadow-inner"
      />
    </div>
  );
}
