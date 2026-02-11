import { getAdsConfig } from "@/lib/ads-config";

export default async function TopBannerAd() {
  const config = await getAdsConfig();
  if (!config.adsEnabled) {
    return null;
  }

  return (
    <div className="w-full rounded-2xl border border-slate-300 bg-white px-6 py-4 text-sm text-slate-600 shadow-sm">
      <div className="flex items-center justify-between">
        <span>Boost your JSON workflow with pro templates and export automations.</span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Sponsored</span>
      </div>
    </div>
  );
}
