import { TRPCError } from "@trpc/server";
import { fmsFetch } from "@/lib/fms";
import { setAuthCookies, clearAuthCookies, type AuthTokens } from "./cookies";

const REFRESH_THRESHOLD_MS = 2 * 60 * 1000;

interface RefreshResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  refresh_token_ttl: number;
}

export function decodeJwtPayload(token: string): { exp?: number; sub?: string } {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return {};
    const payload = Buffer.from(parts[1], "base64url").toString("utf-8");
    return JSON.parse(payload);
  } catch {
    return {};
  }
}

function isTokenExpiringSoon(accessToken: string): boolean {
  const { exp } = decodeJwtPayload(accessToken);
  if (!exp) return true;
  const expiresAt = exp * 1000;
  return expiresAt - Date.now() < REFRESH_THRESHOLD_MS;
}

export async function ensureValidToken(
  tokens: AuthTokens
): Promise<string | null> {
  const { accessToken, refreshToken } = tokens;

  if (accessToken && !isTokenExpiringSoon(accessToken)) {
    return accessToken;
  }

  if (!refreshToken) {
    return null;
  }

  try {
    const result = await fmsFetch<RefreshResponse>("/auth/refresh", {
      method: "POST",
      body: { refresh_token: refreshToken },
    });

    await setAuthCookies(result);
    return result.access_token;
  } catch (err) {
    if (err instanceof TRPCError && err.code === "UNAUTHORIZED") {
      await clearAuthCookies();
    }
    return null;
  }
}
