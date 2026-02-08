import { SignJWT } from "jose";

const requireEnv = (name: string): string => {
  const value = process.env[name];
  if (!value) {
    throw new Error(`Missing ${name}`);
  }
  return value;
};

export const createBackendToken = async ({
  subject,
  email,
  roles,
}: {
  subject: string;
  email?: string;
  roles?: string[];
}): Promise<string> => {
  const secret = requireEnv("BACKEND_JWT_SECRET");
  const issuer = requireEnv("BACKEND_JWT_ISSUER");
  const audience = requireEnv("BACKEND_JWT_AUDIENCE");
  const encodedSecret = new TextEncoder().encode(secret);

  return new SignJWT({ email, roles })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(subject)
    .setIssuer(issuer)
    .setAudience(audience)
    .setIssuedAt()
    .setExpirationTime("15m")
    .sign(encodedSecret);
};
