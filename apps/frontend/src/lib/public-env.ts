const getPublicEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value;
};

export const publicEnv = {
  siteUrl: getPublicEnv("NEXT_PUBLIC_SITE_URL", "http://localhost:4000"),
  apiUrl: getPublicEnv("NEXT_PUBLIC_API_URL", "http://localhost:4001/api"),
  appUrl: getPublicEnv("NEXT_PUBLIC_APP_URL", "http://localhost:4000"),
  siteLabel: getPublicEnv("NEXT_PUBLIC_SITE_LABEL", "JSONDeck"),
};
