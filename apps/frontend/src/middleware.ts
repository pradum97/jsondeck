import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

const ADMIN_ROLES = new Set(["admin", "superadmin"]);

const hasAdminRole = (token: Awaited<ReturnType<typeof getToken>>): boolean => {
  if (!token) {
    return false;
  }

  const explicitRole = typeof token.role === "string" ? token.role : null;
  if (explicitRole && ADMIN_ROLES.has(explicitRole)) {
    return true;
  }

  const tokenRoles = Array.isArray((token as { roles?: unknown }).roles)
    ? ((token as { roles?: unknown[] }).roles ?? [])
    : [];

  return tokenRoles.some((role) => typeof role === "string" && ADMIN_ROLES.has(role));
};

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (!token) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", request.nextUrl.pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (request.nextUrl.pathname.startsWith("/settings/admin") && !hasAdminRole(token)) {
    return NextResponse.redirect(new URL("/settings", request.url));
  }

  return NextResponse.next();
};

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/editor/:path*",
    "/transform/:path*",
    "/tools/:path*",
    "/api-tester/:path*",
    "/settings/admin/:path*",
  ],
};
