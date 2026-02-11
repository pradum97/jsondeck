"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { decodeJwt } from "@/lib/tool-utils";

export function JwtTool() {
  const [token, setToken] = useState("");
  const payload = useMemo(() => decodeJwt(token), [token]);

  return (
    <ToolCard
      title="JWT Inspector"
      description="Decode headers, claims, and signature segments instantly."
    >
      <div className="grid gap-4">
        <textarea
          value={token}
          onChange={(event) => setToken(event.target.value)}
          placeholder="Paste JWT token"
          className="min-h-[120px] w-full rounded-2xl border border-slate-300 bg-white dark:border-slate-800/70 dark:bg-slate-950/80 p-4 text-sm text-slate-900 placeholder:text-slate-500 dark:text-slate-200"
        />
        <div className="grid gap-3 lg:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Header
            </p>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-slate-900 dark:text-slate-200">
              {payload ? JSON.stringify(payload.header, null, 2) : "Awaiting token"}
            </pre>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Payload
            </p>
            <pre className="mt-2 max-h-40 overflow-auto text-xs text-slate-900 dark:text-slate-200">
              {payload ? JSON.stringify(payload.payload, null, 2) : "Awaiting token"}
            </pre>
          </div>
          <div className="rounded-2xl border border-slate-200 bg-white p-4 dark:border-slate-800/70 dark:bg-slate-900/60">
            <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
              Signature
            </p>
            <p className="mt-2 break-words text-xs text-slate-900 dark:text-slate-200">
              {payload ? payload.signature || "Unsigned" : "Awaiting token"}
            </p>
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
