import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { resolveAccess } from "@/lib/routing/app-access";

const FMS_URL = process.env.FMS_URL ?? "http://fms:4000";

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
    return true;
  }
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const STATIC_PREFIXES = ["/_next", "/api", "/favicon.ico"];
  if (STATIC_PREFIXES.some((prefix) => pathname.startsWith(prefix))) {
    return NextResponse.next();
  }

  const initialized = await isSystemInitialized();

  const decision = resolveAccess({
    pathname,
    initialized,
    hasSysadminToken: request.cookies.has("sysadmin_access_token"),
    hasAccessToken: request.cookies.has("access_token"),
    hasCurrentOrg: request.cookies.has("current_org"),
    forceSelectOrg: request.nextUrl.searchParams.get("force") === "1",
  });

  if (decision.type === "redirect") {
    return NextResponse.redirect(new URL(decision.destination, request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
