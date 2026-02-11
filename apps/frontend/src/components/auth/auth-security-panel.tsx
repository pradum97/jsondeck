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
        <p className="text-sm uppercase tracking-[0.3em] text-muted">Identity</p>
        <h2 className="text-2xl font-semibold text-text">Security & connected providers</h2>
        <p className="text-sm text-secondary">
          Signed in as <span className="font-medium text-text">{userLabel}</span> · Roles: {roles.join(", ")}
        </p>
      </header>
      <div className="grid gap-4 md:grid-cols-2">
        {providers.map((provider) => (
          <motion.div
            key={provider.name}
            className="rounded-2xl border border-border bg-card p-4 shadow-lg"
            whileHover={{ y: -4 }}
            transition={{ duration: 0.2 }}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-semibold text-text">{provider.name}</h3>
                <p className="text-sm text-muted">{provider.description}</p>
              </div>
              <span
                className={
                  provider.connected
                    ? "rounded-full bg-success/15 px-3 py-1 text-xs font-semibold text-success"
                    : "rounded-full bg-section px-3 py-1 text-xs font-semibold text-secondary"
                }
              >
                {provider.connected ? "Connected" : "Not linked"}
              </span>
            </div>
            <button
              className="mt-4 w-full rounded-xl border border-border bg-section px-4 py-2 text-sm font-semibold text-secondary transition hover:border-accent hover:text-text"
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
