import type { NextAuthOptions } from "next-auth";
import GoogleProvider from "next-auth/providers/google";
import GitHubProvider from "next-auth/providers/github";
import CredentialsProvider from "next-auth/providers/credentials";
import { createBackendToken } from "@/lib/backend-auth";

export type UserRole = "free" | "pro" | "team";

const backendBaseUrl =
  process.env.BACKEND_BASE_URL ||
  process.env.BACKEND_URL ||
  process.env.NEXT_PRIVATE_BACKEND_URL ||
  "http://localhost:6000/api";

const syncAccountProfile = async ({
  subject,
  email,
  displayName,
  provider,
  providerId,
}: {
  subject: string;
  email?: string | null;
  displayName?: string | null;
  provider?: string;
  providerId?: string;
}): Promise<void> => {
  const token = await createBackendToken({
    subject,
    email: email ?? undefined,
    roles: [],
  });

  await fetch(`${backendBaseUrl}/auth/profile`, {
    method: "PATCH",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      email: email ?? undefined,
      displayName: displayName ?? undefined,
    }),
  });

  if (provider && providerId) {
    await fetch(`${backendBaseUrl}/auth/providers`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        provider,
        providerId,
      }),
    });
  }
};

export const authOptions: NextAuthOptions = {
  session: {
    strategy: "jwt",
  },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID ?? "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET ?? "",
    }),
    GitHubProvider({
      clientId: process.env.GITHUB_CLIENT_ID ?? "",
      clientSecret: process.env.GITHUB_CLIENT_SECRET ?? "",
    }),
    CredentialsProvider({
      id: "email-otp",
      name: "Email OTP",
      credentials: {
        email: { label: "Email", type: "email" },
        otp: { label: "OTP", type: "text" },
      },
      async authorize(credentials) {
        const email = credentials?.email?.trim();
        const otp = credentials?.otp?.trim();
        if (!email || !otp) {
          return null;
        }

        const response = await fetch(`${backendBaseUrl}/auth/otp/verify`, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ email, otp }),
        });

        if (!response.ok) {
          return null;
        }

        const data = (await response.json()) as {
          user?: { id: string; email?: string; roles?: string[] };
        };

        if (!data.user?.id) {
          return null;
        }

        return {
          id: data.user.id,
          email: data.user.email ?? email,
          role: (data.user.roles?.[0] as UserRole) ?? "free",
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, trigger, session, user }) {
      if (!token.role) {
        token.role = "free";
      }
      if (trigger === "update" && session?.role) {
        token.role = session.role;
      }
      if (user && "role" in user && user.role) {
        token.role = user.role as UserRole;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = token.sub ?? session.user.id;
        session.user.role = (token.role as UserRole) ?? "free";
      }
      return session;
    },
    async signIn({ user, account }) {
      if (!user?.id) {
        return false;
      }
      try {
        await syncAccountProfile({
          subject: user.id,
          email: user.email,
          displayName: user.name,
          provider: account?.provider,
          providerId: account?.providerAccountId,
        });
      } catch (error) {
        console.error("Failed to sync account profile", error);
      }
      return true;
    },
  },
  pages: {
    signIn: "/login",
  },
  secret: process.env.NEXTAUTH_SECRET,
};
