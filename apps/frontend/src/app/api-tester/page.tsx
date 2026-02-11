import dynamic from "next/dynamic";

const ApiTesterPage = dynamic(
  () => import("@/components/api-tester/api-tester-page").then((mod) => mod.ApiTesterPage),
  {
    ssr: false,
    loading: () => (
      <div className="rounded-xl border border-border bg-card p-6 text-muted-foreground">
        Loading API tester...
      </div>
    ),
  }
);

export default function ApiTesterRoute() {
  return <ApiTesterPage />;
}
