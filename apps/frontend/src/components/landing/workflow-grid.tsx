"use client";

import { motion } from "framer-motion";

const workflows = [
  {
    title: "Live JSON validation",
    detail:
      "Validate schemas, lint payloads, and auto-correct formatting with precision tooling.",
  },
  {
    title: "Transform pipelines",
    detail:
      "Convert JSON into SQL, GraphQL, and typed SDKs with repeatable automation.",
  },
  {
    title: "Observability layer",
    detail:
      "Trace API calls, monitor latency, and export usage analytics by workspace.",
  },
  {
    title: "Secure collaboration",
    detail:
      "Role-based access, audit logs, and encrypted storage ready for enterprise teams.",
  },
];

export function WorkflowGrid() {
  return (
    <section className="glass rounded-3xl border border-slate-800/80 p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs uppercase tracking-[0.3em] text-slate-500">
            Platform Workflow
          </p>
          <h3 className="text-2xl font-semibold text-slate-100">
            Everything your JSON lifecycle needs, in one workspace.
          </h3>
        </div>
        <button className="rounded-full border border-emerald-400/40 bg-emerald-400/10 px-5 py-2 text-xs uppercase tracking-[0.25em] text-emerald-200 transition hover:border-emerald-400/70">
          Explore Workflow
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {workflows.map((workflow, index) => (
          <motion.div
            key={workflow.title}
            className="rounded-2xl border border-slate-800/70 bg-slate-950/70 p-5"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <h4 className="text-base font-semibold text-slate-100">
              {workflow.title}
            </h4>
            <p className="mt-2 text-sm text-slate-400">{workflow.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
