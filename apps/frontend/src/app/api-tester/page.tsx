import dynamic from "next/dynamic";

const ApiTesterPage = dynamic(
  () => import("@/components/api-tester/api-tester-page").then((mod) => mod.ApiTesterPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-3xl border border-slate-800/70 bg-slate-950/50 p-6 text-slate-300">
        Loading API tester...
      </div>
    ),
  }
);

export default function ApiTesterRoute() {
  return <ApiTesterPage />;
}
