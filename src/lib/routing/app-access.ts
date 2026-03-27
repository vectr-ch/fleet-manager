const PUBLIC_PATHS = ["/login", "/forgot-password", "/reset-password"];
const ALWAYS_PUBLIC_PATHS = ["/invites/accept"];
const ADMIN_PUBLIC_PATHS = ["/admin/login", "/admin/accept-invite", "/admin/reset-password"];
const SEMI_PUBLIC_PATHS = ["/select-org"];

export type AccessDecision =
  | { type: "next" }
  | { type: "redirect"; destination: string };

export interface AccessState {
  pathname: string;
  initialized: boolean;
  hasSysadminToken: boolean;
  hasAccessToken: boolean;
  hasCurrentOrg: boolean;
  forceSelectOrg: boolean;
}

function isPublicPath(pathname: string, publicPaths: string[]) {
  return publicPaths.some((p) => pathname === p || pathname.startsWith(`${p}/`));
}

export function shouldShowAdminShell(pathname: string) {
  return !isPublicPath(pathname, ADMIN_PUBLIC_PATHS);
}

export function getInviteAcceptContinuePath(isLoggedIn: boolean) {
  return isLoggedIn ? "/select-org?force=1" : "/login";
}

export function resolveAccess(state: AccessState): AccessDecision {
  const {
    pathname,
    initialized,
    hasSysadminToken,
    hasAccessToken,
    hasCurrentOrg,
    forceSelectOrg,
  } = state;

  if (pathname === "/setup" || pathname.startsWith("/setup/")) {
    if (initialized) {
      return { type: "redirect", destination: "/admin/login" };
    }
    return { type: "next" };
  }

  if (!initialized) {
    return { type: "redirect", destination: "/setup" };
  }

  if (pathname === "/") {
    return { type: "next" };
  }

  if (pathname.startsWith("/admin")) {
    if (isPublicPath(pathname, ADMIN_PUBLIC_PATHS)) {
      if (hasSysadminToken) {
        return { type: "redirect", destination: "/admin/organisations" };
      }
      return { type: "next" };
    }

    if (!hasSysadminToken) {
      return { type: "redirect", destination: "/admin/login" };
    }
    return { type: "next" };
  }

  if (isPublicPath(pathname, ALWAYS_PUBLIC_PATHS)) {
    return { type: "next" };
  }

  if (isPublicPath(pathname, PUBLIC_PATHS)) {
    if (hasAccessToken) {
      return {
        type: "redirect",
        destination: hasCurrentOrg ? "/overview" : "/select-org",
      };
    }
    return { type: "next" };
  }

  if (isPublicPath(pathname, SEMI_PUBLIC_PATHS)) {
    if (!hasAccessToken) {
      return { type: "redirect", destination: "/login" };
    }
    if (hasCurrentOrg && !forceSelectOrg) {
      return { type: "redirect", destination: "/overview" };
    }
    return { type: "next" };
  }

  if (!hasAccessToken) {
    return { type: "redirect", destination: "/login" };
  }
  if (!hasCurrentOrg) {
    return { type: "redirect", destination: "/select-org" };
  }

  return { type: "next" };
}
