"use client";

import { motion } from "framer-motion";

export interface AuthProviderStatus {
  name: string;
  description: string;
  connected: boolean;
}

interface AuthSecurityPanelProps {
  userLabel: string;
  roles: string[];
  providers: AuthProviderStatus[];
}

export function AuthSecurityPanel({ userLabel, roles, providers }: AuthSecurityPanelProps) {
  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-300/70">Identity</p>
        <h2 className="text-2xl font-semibold text-white">Security & connected providers</h2>
        <p className="text-sm text-slate-300">
          Signed in as <span className="font-medium text-white">{userLabel}</span> · Roles: {roles.join(", ")}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <motion.div
            key={provider.name}
            className="rounded-2xl border border-slate-800/80 bg-slate-950/70 p-4 shadow-lg"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-white">{provider.name}</h3>
                <p className="text-sm text-slate-400">{provider.description}</p>
              </div>
              <span
                className={
                  provider.connected
                    ? "rounded-full bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-200"
                    : "rounded-full bg-slate-700/50 px-3 py-1 text-xs font-semibold text-slate-300"
                }
              >
                {provider.connected ? "Connected" : "Not linked"}
              </span>
            </div>
            <button
              className="mt-4 w-full rounded-xl border border-slate-700/70 bg-slate-900/80 px-4 py-2 text-sm font-semibold text-slate-200 transition hover:border-teal-400/60 hover:text-white"
              type="button"
            >
              {provider.connected ? "Manage connection" : "Connect provider"}
            </button>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
