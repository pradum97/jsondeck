import { BillingOverview } from "@/components/billing/billing-overview";
import { SubscriptionSummary } from "@/components/billing/subscription-summary";
import { AdPreferencePanel } from "@/components/ads/ad-preference-panel";

const plans = [
  {
    name: "Free",
    priceMonthly: "$0 / month",
    priceYearly: "$0 / year",
    description: "Essential JSON editing with community automations.",
    features: ["Single workspace", "Limited transformations", "Community templates"],
  },
  {
    name: "Pro",
    priceMonthly: "$24 / month",
    priceYearly: "$228 / year",
    description: "Advanced tooling, priority compute, and zero ads.",
    features: ["Unlimited workspaces", "Advanced API tester", "No ads"],
    highlighted: true,
  },
  {
    name: "Team",
    priceMonthly: "$72 / month",
    priceYearly: "$680 / year",
    description: "Centralized billing with audit trails for enterprise teams.",
    features: ["Team roles", "Audit logs", "SAML-ready"],
  },
];

export default function DashboardPage() {
  return (
    <div className="space-y-10">
      <header className="space-y-3">
        <p className="text-sm uppercase tracking-[0.4em] text-teal-300/70">Dashboard</p>
        <h1 className="text-3xl font-semibold text-white">Billing & workspace controls</h1>
        <p className="text-sm text-slate-300">
          Manage subscriptions, ads, and identity-linked security policies from a single command center.
        </p>
      </header>
      <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
        <BillingOverview plans={plans} defaultPlan="Pro" />
        <SubscriptionSummary planName="Pro" renewsOn="Oct 12, 2025" seats={12} />
      </div>
      <AdPreferencePanel initialEnabled={false} adProfile="Enterprise safe" />
    </div>
  );
}
