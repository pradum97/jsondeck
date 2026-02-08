import { cookies } from "next/headers";
import type { UserRole } from "@/lib/auth";

export interface AdsConfig {
  role: UserRole;
  adsEnabled: boolean;
}

export const getAdsConfig = async (): Promise<AdsConfig> => {
  const baseUrl = process.env.NEXTAUTH_URL ?? process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:4000";
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  const response = await fetch(new URL("/api/config", baseUrl), {
    headers: cookieHeader ? { cookie: cookieHeader } : {},
    cache: "no-store",
  });

  if (!response.ok) {
    return { role: "free", adsEnabled: true };
  }

  const data = (await response.json()) as { role?: UserRole; adsEnabled?: boolean };
  return {
    role: data.role ?? "free",
    adsEnabled: Boolean(data.adsEnabled),
  };
};
