import { getAdsConfig } from "@/lib/ads-config";

export default async function SidebarAd() {
  const config = await getAdsConfig();
  if (!config.adsEnabled) {
    return null;
  }

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 text-sm text-slate-600 shadow-sm">
      <div className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Sponsored</div>
      <div className="space-y-2">
        <p className="font-medium text-slate-900">Ship faster with team workspaces and shared snippets.</p>
        <p>Upgrade to unlock collaboration, auditing, and premium integrations.</p>
      </div>
    </div>
  );
}
