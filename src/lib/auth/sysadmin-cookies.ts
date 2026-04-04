import { cookies } from "next/headers";
import { TRPCError } from "@trpc/server";
import { fmsFetch } from "@/lib/fms";
import { decodeJwtPayload } from "@/lib/auth/refresh";

const SECURE = process.env.NODE_ENV === "production";
const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

export interface SysadminAuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export async function setSysadminAuthCookies(loginResult: {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_ttl?: number;
}) {
  const cookieStore = await cookies();

  if (loginResult.access_token) {
    cookieStore.set("sysadmin_access_token", loginResult.access_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: loginResult.refresh_token_ttl ?? 604800,
    });
  }

  if (loginResult.refresh_token) {
    cookieStore.set("sysadmin_refresh_token", loginResult.refresh_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: loginResult.refresh_token_ttl ?? 604800,
    });
  }
}

export async function clearSysadminAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("sysadmin_access_token");
  cookieStore.delete("sysadmin_refresh_token");
  cookieStore.delete("sysadmin_mfa_challenge");
}

export async function getSysadminTokens(): Promise<SysadminAuthTokens> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("sysadmin_access_token")?.value ?? null,
    refreshToken: cookieStore.get("sysadmin_refresh_token")?.value ?? null,
  };
}

export async function setSysadminChallengeCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("sysadmin_mfa_challenge", token, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
}

export async function clearSysadminChallengeCookie() {
  const cookieStore = await cookies();
  cookieStore.delete("sysadmin_mfa_challenge");
}

export async function getSysadminChallengeToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("sysadmin_mfa_challenge")?.value ?? null;
}

// ─── Sysadmin-specific refresh logic ─────────────────────────

interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_ttl: number;
}

function isTokenExpiringSoon(accessToken: string): boolean {
  const { exp } = decodeJwtPayload(accessToken);
  if (!exp) return true;
  return exp * 1000 - Date.now() < REFRESH_THRESHOLD_MS;
}

export async function ensureSysadminValidToken(
  tokens: SysadminAuthTokens
): Promise<string | null> {
  const { accessToken, refreshToken } = tokens;

  if (accessToken && !isTokenExpiringSoon(accessToken)) {
    return accessToken;
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const result = await fmsFetch<RefreshResponse>("/sysadmin/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    await setSysadminAuthCookies(result);
    return result.access_token;
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") {
      await clearSysadminAuthCookies();
    }
    return null;
  }
}
