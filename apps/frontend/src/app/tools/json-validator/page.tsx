import dynamic from "next/dynamic";

const JsonValidatorPage = dynamic(() => import("@/components/tools/json-validator-page").then((mod) => mod.JsonValidatorPage), { ssr: false });

export default function JsonValidatorRoute() {
  return <JsonValidatorPage />;
}
