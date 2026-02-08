import { getAdsConfig } from "@/lib/ads-config";

export default async function InlineAd() {
  const config = await getAdsConfig();
  if (!config.adsEnabled) {
    return null;
  }

  return (
    <div className="rounded-xl border border-dashed border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-500">
      <div className="flex items-center justify-between">
        <span>Sponsored · Try smart validation rules with pro.</span>
        <span className="font-semibold text-slate-700">Upgrade</span>
      </div>
    </div>
  );
}
