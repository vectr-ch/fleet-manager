import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
// Always accessible regardless of auth state (no redirect for logged-in users).
const ALWAYS_PUBLIC_PATHS = ["/invites/accept"];
const ADMIN_PUBLIC_PATHS = ["/admin/login"];
// Require access_token but NOT current_org (cross-org pages).
const SEMI_PUBLIC_PATHS = ["/select-org"];

function isPublicPath(pathname: string, publicPaths: string[]) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico"];
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // Skip marketing root
  if (pathname === "/") {
    return NextResponse.next();
  }

  // ─── Admin routes ───────────────────────────────────────────
  if (pathname.startsWith("/admin")) {
    const hasSysadminToken = request.cookies.has("sysadmin_access_token");

    if (isPublicPath(pathname, ADMIN_PUBLIC_PATHS)) {
      if (hasSysadminToken) {
        return NextResponse.redirect(new URL("/admin/organisations", request.url));
      }
      return NextResponse.next();
    }

    if (!hasSysadminToken) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  // ─── Org routes ─────────────────────────────────────────────
  const hasAccessToken = request.cookies.has("access_token");
  const hasCurrentOrg = request.cookies.has("current_org");

  // Always-public pages (invites) — accessible regardless of auth state
  if (isPublicPath(pathname, ALWAYS_PUBLIC_PATHS)) {
    return NextResponse.next();
  }

  // Public pages (login, reset-password, etc.)
  if (isPublicPath(pathname, PUBLIC_PATHS)) {
    if (hasAccessToken) {
      // Redirect authenticated users to the right place
      return NextResponse.redirect(
        new URL(hasCurrentOrg ? "/overview" : "/select-org", request.url)
      );
    }
    return NextResponse.next();
  }

  // Semi-public pages: need access_token, but not current_org
  if (isPublicPath(pathname, SEMI_PUBLIC_PATHS)) {
    if (!hasAccessToken) {
      return NextResponse.redirect(new URL("/login", request.url));
    }
    // If already has an org, no need to stay on select-org
    if (hasCurrentOrg) {
      return NextResponse.redirect(new URL("/overview", request.url));
    }
    return NextResponse.next();
  }

  // Protected pages: need both access_token and current_org
  if (!hasAccessToken) {
    return NextResponse.redirect(new URL("/login", request.url));
  }
  if (!hasCurrentOrg) {
    return NextResponse.redirect(new URL("/select-org", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
