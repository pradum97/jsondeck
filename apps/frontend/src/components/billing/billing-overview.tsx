"use client";

import { useState } from "react";
import { PlanCard, type PlanTier } from "@/components/billing/plan-card";

interface BillingOverviewProps {
  plans: PlanTier[];
  defaultPlan: string;
}

export function BillingOverview({ plans, defaultPlan }: BillingOverviewProps) {
  const [selectedPlan, setSelectedPlan] = useState(defaultPlan);

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <p className="text-sm uppercase tracking-[0.3em] text-teal-300/70">Billing</p>
        <h2 className="text-2xl font-semibold text-white">Subscription plans</h2>
        <p className="text-sm text-slate-300">
          Upgrade to unlock team collaboration, audit logs, and ad-free environments.
        </p>
      </header>
      <div className="grid gap-4 lg:grid-cols-3">
        {plans.map((plan) => (
          <PlanCard
            key={plan.name}
            plan={plan}
            active={selectedPlan === plan.name}
            onSelect={() => setSelectedPlan(plan.name)}
          />
        ))}
      </div>
    </section>
  );
}
