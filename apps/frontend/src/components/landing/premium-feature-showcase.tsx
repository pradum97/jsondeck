"use client";

import { motion } from "framer-motion";

const features = [
  {
    title: "Live collaboration timelines",
    description: "Track edits, approvals, and payload versions with per-field history across every JSON workspace.",
  },
  {
    title: "Schema-aware smart editor",
    description: "Autocomplete keys from OpenAPI and JSON Schema sources so production payloads stay compliant.",
  },
  {
    title: "Secure API data imports",
    description: "Load signed API responses directly into the editor and sanitize sensitive tokens before sharing.",
  },
  {
    title: "Release-ready exports",
    description: "Ship validated payload bundles for integration tests, SDK generation, and deployment pipelines.",
  },
];

export function PremiumFeatureShowcase() {
  return (
    <section className="grid gap-4 lg:grid-cols-2">
      {features.map((feature, index) => (
        <motion.article
          key={feature.title}
          className="glass rounded-3xl border border-slate-800/70 p-6"
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.3 }}
          transition={{ duration: 0.35, delay: index * 0.06 }}
        >
          <p className="text-xs uppercase tracking-[0.24em] text-cyan-300">Premium Capability</p>
          <h3 className="mt-2 text-xl font-semibold text-slate-100">{feature.title}</h3>
          <p className="mt-3 text-sm text-slate-300">{feature.description}</p>
        </motion.article>
      ))}
    </section>
  );
}
