import { getAdsConfig } from "@/lib/ads-config";

export default async function BottomStickyAd() {
  const config = await getAdsConfig();
  if (!config.adsEnabled) {
    return null;
  }

  return (
    <div className="fixed bottom-4 left-1/2 z-50 w-[min(90vw,720px)] -translate-x-1/2 rounded-2xl border border-slate-300 bg-white px-5 py-3 text-sm text-slate-700 shadow-sm">
      <div className="flex items-center justify-between gap-3">
        <span>Stay focused. Remove ads with a pro subscription.</span>
        <span className="rounded-full bg-slate-900 px-3 py-1 text-xs font-semibold text-white">Sponsored</span>
      </div>
    </div>
  );
}
