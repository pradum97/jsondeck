import axios from "axios";
import { cookies } from "next/headers";
import type { UserRole } from "@/lib/auth";
import { serverEnv } from "@/lib/server-env";

export interface AdsConfig {
  role: UserRole;
  adsEnabled: boolean;
}

export const getAdsConfig = async (): Promise<AdsConfig> => {
  const baseUrl = serverEnv.nextAuthUrl;
  const cookieStore = cookies();
  const cookieHeader = cookieStore
    .getAll()
    .map(({ name, value }) => `${name}=${value}`)
    .join("; ");

  try {
    const response = await axios.get<{ role?: UserRole; adsEnabled?: boolean }>(new URL("/api/config", baseUrl).toString(), {
      headers: cookieHeader ? { cookie: cookieHeader } : {},
    });
    const data = response.data;
    return {
      role: data.role ?? "free",
      adsEnabled: Boolean(data.adsEnabled),
    };
  } catch (error) {
    return { role: "free", adsEnabled: true };
  }
};
