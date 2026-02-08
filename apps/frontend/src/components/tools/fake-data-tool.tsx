"use client";

import { useMemo, useState } from "react";
import { ToolCard } from "@/components/tools/tool-card";
import { generateFakeProfile } from "@/lib/tool-utils";

export function FakeDataTool() {
  const [seed, setSeed] = useState(42);
  const profile = useMemo(() => generateFakeProfile(seed), [seed]);

  return (
    <ToolCard
      title="Fake Data Forge"
      description="Generate realistic profiles for testing and prototyping."
    >
      <div className="grid gap-4">
        <div className="flex items-center gap-3">
          <label className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Seed
          </label>
          <input
            type="number"
            value={seed}
            onChange={(event) => setSeed(Number(event.target.value))}
            className="w-32 rounded-2xl border border-slate-800/70 bg-slate-950/80 px-3 py-2 text-sm text-slate-200"
          />
        </div>
        <div className="grid gap-2 rounded-2xl border border-slate-800/70 bg-slate-900/60 p-4 text-sm text-slate-200">
          <div className="flex justify-between">
            <span className="text-slate-400">ID</span>
            <span>{profile.id}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Name</span>
            <span>{profile.name}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Email</span>
            <span>{profile.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Role</span>
            <span>{profile.role}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Company</span>
            <span>{profile.company}</span>
          </div>
        </div>
      </div>
    </ToolCard>
  );
}
