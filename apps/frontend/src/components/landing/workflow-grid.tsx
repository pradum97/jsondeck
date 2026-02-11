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
    <section className="premium-card rounded-3xl p-8">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.3em] text-slate-500 dark:text-slate-400">
            Platform Workflow
          </p>
          <h3 className="text-2xl font-semibold text-slate-900 dark:text-slate-100">
            Everything your JSON lifecycle needs, in one workspace.
          </h3>
        </div>
        <button className="rounded-full border border-blue-600 bg-blue-600 px-5 py-2 text-xs font-semibold uppercase tracking-[0.25em] text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-blue-700 hover:shadow-md">
          Explore Workflow
        </button>
      </div>
      <div className="mt-6 grid gap-4 md:grid-cols-2">
        {workflows.map((workflow, index) => (
          <motion.div
            key={workflow.title}
            className="rounded-2xl border border-slate-300 bg-white p-5 shadow-sm transition hover:shadow-md dark:border-slate-700 dark:bg-slate-900"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            whileHover={{ y: -2 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
          >
            <h4 className="text-base font-semibold text-slate-900 dark:text-slate-100">
              {workflow.title}
            </h4>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">{workflow.detail}</p>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
