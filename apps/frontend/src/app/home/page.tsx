import { LandingHero } from "@/components/landing/landing-hero";
import { PlatformHighlights } from "@/components/landing/platform-highlights";
import { WorkflowGrid } from "@/components/landing/workflow-grid";
import { PremiumFeatureShowcase } from "@/components/landing/premium-feature-showcase";

export default function HomeMarketingPage() {
  return (
    <main className="mx-auto flex w-full max-w-7xl flex-1 flex-col gap-6 py-3 sm:py-4">
      <LandingHero />
      <PremiumFeatureShowcase />
      <PlatformHighlights />
      <WorkflowGrid />
    </main>
  );
}
