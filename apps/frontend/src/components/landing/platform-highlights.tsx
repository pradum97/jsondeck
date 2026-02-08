"use client";

import { motion } from "framer-motion";

const highlights = [
  {
    title: "VSCode-grade editor",
    description:
      "Multi-tab JSON editing with linting, diff views, and instant validation.",
  },
  {
    title: "Postman-class API testing",
    description:
      "Compose, fire, and monitor requests with environments, history, and analytics.",
  },
  {
    title: "Studio-grade transforms",
    description:
      "Transform JSON into types, schemas, and datasets with AI-ready pipelines.",
  },
];

export function PlatformHighlights() {
  return (
    <section className="grid gap-6 lg:grid-cols-3">
      {highlights.map((highlight, index) => (
        <motion.article
          key={highlight.title}
          className="glass rounded-3xl border border-slate-800/80 p-6"
          initial={{ opacity: 0, y: 14 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: index * 0.08 }}
        >
          <h3 className="text-lg font-semibold text-slate-100">
            {highlight.title}
          </h3>
          <p className="mt-3 text-sm text-slate-300">
            {highlight.description}
          </p>
        </motion.article>
      ))}
    </section>
  );
}
