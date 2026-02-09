const requirePublicEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const publicEnv = {
  siteUrl: requirePublicEnv("NEXT_PUBLIC_SITE_URL"),
  apiUrl: requirePublicEnv("NEXT_PUBLIC_API_URL"),
  appUrl: requirePublicEnv("NEXT_PUBLIC_APP_URL"),
  siteLabel: requirePublicEnv("NEXT_PUBLIC_SITE_LABEL"),
};
