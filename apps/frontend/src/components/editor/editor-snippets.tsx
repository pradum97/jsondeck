"use client";

import { motion } from "framer-motion";

type Snippet = {
  name: string;
  description: string;
  payload: string;
};

const SNIPPETS: Snippet[] = [
  {
    name: "API Response",
    description: "Paginated REST response template.",
    payload: `{
  "data": [],
  "pagination": {
    "page": 1,
    "perPage": 25,
    "total": 0
  },
  "status": "ok"
}`,
  },
  {
    name: "Event Payload",
    description: "Webhook payload signature example.",
    payload: `{
  "id": "evt_01HXYZ",
  "type": "deployment.completed",
  "createdAt": "2024-02-12T18:04:12Z",
  "actor": {
    "id": "usr_2024",
    "email": "dev@jsondeck.dev"
  }
}`,
  },
  {
    name: "Config",
    description: "Typed configuration object.",
    payload: `{
  "environment": "production",
  "region": "us-east-1",
  "flags": {
    "betaFeatures": false,
    "experimental": []
  }
}`,
  },
];

type EditorSnippetsProps = {
  onInsert: (payload: string) => void;
};

export function EditorSnippets({ onInsert }: EditorSnippetsProps) {
  return (
    <div className="space-y-3 rounded-3xl border border-slate-800/70 bg-slate-950/60 p-4 shadow-inner">
      <div className="flex items-center justify-between">
        <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-400">
          Snippets
        </p>
        <span className="rounded-full border border-slate-800/80 px-3 py-1 text-[10px] text-slate-500">
          Insert
        </span>
      </div>
      <div className="space-y-2">
        {SNIPPETS.map((snippet) => (
          <motion.button
            key={snippet.name}
            whileHover={{ y: -1 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onInsert(snippet.payload)}
            className="flex w-full flex-col items-start gap-1 rounded-2xl border border-slate-800/80 bg-slate-900/60 px-3 py-2 text-left text-xs text-slate-300 transition hover:border-slate-700"
          >
            <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-cyan-200">
              {snippet.name}
            </span>
            <span className="text-[11px] text-slate-400">
              {snippet.description}
            </span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
