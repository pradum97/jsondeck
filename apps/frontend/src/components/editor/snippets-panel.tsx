"use client";

import { useState } from "react";
import { useEditorStore } from "@/stores/editor-store";

export function SnippetsPanel() {
  const snippets = useEditorStore((state) => state.snippets);
  const addSnippet = useEditorStore((state) => state.addSnippet);
  const insertSnippet = useEditorStore((state) => state.insertSnippet);
  const [name, setName] = useState("");
  const [content, setContent] = useState("");

  const handleAdd = () => {
    if (!name.trim() || !content.trim()) return;
    addSnippet({ name: name.trim(), content: content.trim() });
    setName("");
    setContent("");
  };

  return (
    <section className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4">
      <div className="flex items-center justify-between">
        <h3 className="text-xs font-semibold uppercase tracking-[0.2em] text-slate-300">
          Snippets
        </h3>
        <span className="text-[10px] text-slate-500">
          {snippets.length} saved
        </span>
      </div>
      <div className="mt-4 space-y-3">
        {snippets.map((snippet) => (
          <button
            key={snippet.id}
            type="button"
            onClick={() => insertSnippet(snippet.id)}
            className="w-full rounded-xl border border-slate-800/70 bg-slate-900/40 px-3 py-2 text-left text-xs text-slate-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
          >
            <div className="font-semibold">{snippet.name}</div>
            <div className="mt-1 line-clamp-2 text-[10px] text-slate-400">
              {snippet.content}
            </div>
          </button>
        ))}
      </div>
      <div className="mt-4 border-t border-slate-800/80 pt-4">
        <div className="space-y-2">
          <input
            value={name}
            onChange={(event) => setName(event.target.value)}
            placeholder="Snippet name"
            className="w-full rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
          />
          <textarea
            value={content}
            onChange={(event) => setContent(event.target.value)}
            placeholder="Snippet content"
            rows={3}
            className="w-full resize-none rounded-lg border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-xs text-slate-200 placeholder:text-slate-600"
          />
          <button
            type="button"
            onClick={handleAdd}
            className="w-full rounded-lg border border-slate-800/80 bg-slate-900/50 px-3 py-2 text-xs font-semibold uppercase tracking-[0.2em] text-slate-200 transition hover:border-cyan-400/60 hover:bg-cyan-500/10"
          >
            Save snippet
          </button>
        </div>
      </div>
    </section>
  );
}
