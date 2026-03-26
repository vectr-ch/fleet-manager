import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
// Always accessible regardless of auth state (no redirect for logged-in users).
const ALWAYS_PUBLIC_PATHS = ["/invites/accept"];
const ADMIN_PUBLIC_PATHS = ["/admin/login"];
// Require access_token but NOT current_org (cross-org pages).
const SEMI_PUBLIC_PATHS = ["/select-org"];

const FMS_URL = process.env.FMS_URL ?? "http://fms:4000";

// Module-level init status cache.
//
// This is a monotonic boolean: once the system is initialized (sysadmin
// exists), it stays initialized forever. The caching strategy exploits this:
//
// - `true`  → permanent cache hit, zero cost on all subsequent requests.
// - `false` → re-checked every CHECK_INTERVAL_MS to detect when setup completes.
// - `null`  → first request; fetches from FMS.
//
// Fail-open behaviour: if FMS is unreachable, we return `true` so that users
// are not trapped on /setup when the backend is down. The worst case is they
// see a login page that cannot reach the backend — better than a setup page
// that also cannot reach it.
//
// Multi-replica note: each Next.js instance has its own cache. After setup
// completes on one instance, other instances will continue redirecting to
// /setup for up to CHECK_INTERVAL_MS. The setup page handles this gracefully
// (backend returns 404, frontend redirects to login).
let cachedInitialized: boolean | null = null;
let lastCheckAt = 0;
const CHECK_INTERVAL_MS = 30_000;

async function isSystemInitialized(): Promise<boolean> {
  if (cachedInitialized === true) return true;
  if (
    cachedInitialized !== null &&
    Date.now() - lastCheckAt < CHECK_INTERVAL_MS
  ) {
    return cachedInitialized;
  }
  try {
    const res = await fetch(`${FMS_URL}/init/status`);
    const data = await res.json();
    cachedInitialized = data.initialized;
    lastCheckAt = Date.now();
    return data.initialized;
  } catch {
    return true; // Fail open — see comment above
  }
}

function isPublicPath(pathname: string, publicPaths: string[]) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(p + "/"));
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Skip static assets and API routes
  const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico"];
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  // ─── First-run setup guard ──────────────────────────────────
  const initialized = await isSystemInitialized();

  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    if (initialized) {
      return NextResponse.redirect(new URL("/admin/login", request.url));
    }
    return NextResponse.next();
  }

  if (!initialized) {
    return NextResponse.redirect(new URL("/setup", request.url));
  }

  // ─── Normal routing (system is initialized) ─────────────────

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
