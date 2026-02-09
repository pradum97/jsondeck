const requireServerEnv = (key: string): string => {
  const value = process.env[key];
  if (!value) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
  return value;
};

export const serverEnv = {
  backendBaseUrl: requireServerEnv("BACKEND_URL"),
  nextAuthUrl: requireServerEnv("NEXTAUTH_URL"),
};
