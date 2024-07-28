import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { getToken } from "next-auth/jwt";
import { RoleType } from "@prisma/client";

// Define protected routes and their required roles
const protectedRoutes = {
  "/dashboard": ["ADMIN"],
  "/auth/admin/register": ["ADMIN"],
  "/employee-dashboard": ["EMPLOYEE", "ADMIN"],
  "/cadre/employees": ["CADRE_CONTROLLING_AUTHORITY", "ADMIN"],
  "/cm-dashboard": ["CM", "ADMIN"],
  "/cs-dashboard": ["CS", "ADMIN"],
  "/dop-dashboard": ["DOP", "ADMIN"],
};

export async function middleware(request: NextRequest) {
  const token = (await getToken({
    req: request,
    secret: process.env.NEXTAUTH_SECRET,
  })) as { role: RoleType } | null;

  const path = request.nextUrl.pathname;

  // Check if the path is protected
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route)) {
      if (!token || !allowedRoles.includes(token.role)) {
        // Redirect to sign in page if not authenticated or not authorized
        return NextResponse.redirect(new URL("/auth/signin", request.url));
      }
      break;
    }
  }

  // Special case for admin routes
  if (path.startsWith("/admin")) {
    if (!token || token.role !== "ADMIN") {
      return NextResponse.redirect(new URL("/auth/signin", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/auth/admin/:path*",
    "/employee-dashboard/:path*",
    "/cadre/employees/:path*",
    "/cm-dashboard/:path*",
    "/cs-dashboard/:path*",
    "/dop-dashboard/:path*",
    "/admin/:path*",
  ],
};
