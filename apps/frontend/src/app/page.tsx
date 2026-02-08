import { LandingHero } from "@/components/landing/landing-hero";
import { PlatformHighlights } from "@/components/landing/platform-highlights";
import { WorkflowGrid } from "@/components/landing/workflow-grid";

export default function HomePage() {
  return (
    <main className="min-h-screen px-6 py-12 lg:px-10">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-12">
        <LandingHero />
        <PlatformHighlights />
        <WorkflowGrid />
      </div>
    </main>
  );
}
