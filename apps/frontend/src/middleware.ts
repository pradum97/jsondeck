import type { NextRequest } from "next/server";
import { NextResponse } from "next/server";
import { getToken } from "next-auth/jwt";

export const middleware = async (request: NextRequest): Promise<NextResponse> => {
  const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET });
  if (token) {
    return NextResponse.next();
  }

  const loginUrl = new URL("/login", request.url);
  loginUrl.searchParams.set("next", request.nextUrl.pathname);
  return NextResponse.redirect(loginUrl);
};

export const config = {
  matcher: ["/dashboard/:path*", "/editor/:path*", "/transform/:path*", "/tools/:path*", "/api-tester/:path*"],
};
