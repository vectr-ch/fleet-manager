import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/invite"];
const ADMIN_PUBLIC_PATHS = ["/admin/login"];
const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Skip marketing root
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ─── Admin routes (check sysadmin_access_token) ────────────
  if (pathname.startsWith("/admin")) {
    const hasSysadminToken = request.cookies.has("sysadmin_access_token");

    // Admin public pages
    if (ADMIN_PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
      if (hasSysadminToken) {
        return NextResponse.redirect(new URL("/admin/organisations", request.url));
      }
      return NextResponse.next();
    }

    // Admin protected pages
    if (!hasSysadminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ─── Org routes (check access_token) ───────────────────────
  const hasAccessToken = request.cookies.has("access_token");

  // Org public pages
  if (PUBLIC_PATHS.some((p) => pathname.startsWith(p))) {
    if (hasAccessToken) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  // Org protected pages
  if (!hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico).*)",
  ],
};
