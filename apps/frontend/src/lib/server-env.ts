const getServerEnv = (key: string, fallback: string): string => {
  const value = process.env[key];
  if (!value) {
    return fallback;
  }
  return value;
};

export const serverEnv = {
  backendBaseUrl: getServerEnv("BACKEND_URL", "http://localhost:4001/api"),
  nextAuthUrl: getServerEnv("NEXTAUTH_URL", "http://localhost:4000"),
};
