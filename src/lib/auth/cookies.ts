import { cookies } from "next/headers";

const SECURE = process.env.NODE_ENV === "production";

export interface AuthTokens {
  accessToken: string | null;
  refreshToken: string | null;
}

export async function setAuthCookies(loginResult: {
  access_token?: string;
  expires_in?: number;
  refresh_token?: string;
  refresh_token_ttl?: number;
}) {
  const cookieStore = await cookies();

  if (loginResult.access_token) {
    cookieStore.set("access_token", loginResult.access_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: loginResult.expires_in ?? 900,
    });
  }

  if (loginResult.refresh_token) {
    cookieStore.set("refresh_token", loginResult.refresh_token, {
      httpOnly: true,
      secure: SECURE,
      sameSite: "lax",
      path: "/",
      maxAge: loginResult.refresh_token_ttl ?? 604800,
    });
  }
}

export async function setCurrentOrg(slug: string) {
  const cookieStore = await cookies();
  cookieStore.set("current_org", slug, {
    httpOnly: false,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 365,
  });
}

export async function setChallengeCookie(token: string) {
  const cookieStore = await cookies();
  cookieStore.set("mfa_challenge", token, {
    httpOnly: true,
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 300,
  });
}

// user_info is DISPLAY-ONLY — stores email for initials rendering only.
// Never passed as identity to backend calls. TTL matches refresh_token (7 days).
export async function setUserInfo(email: string) {
  const cookieStore = await cookies();
  cookieStore.set("user_info", JSON.stringify({ email }), {
    httpOnly: false, // intentionally client-readable for initials
    secure: SECURE,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7,
  });
}

export async function clearUserInfo() {
  const cookieStore = await cookies();
  cookieStore.delete("user_info");
}

export async function clearAuthCookies() {
  const cookieStore = await cookies();
  cookieStore.delete("access_token");
  cookieStore.delete("refresh_token");
  cookieStore.delete("current_org");
  cookieStore.delete("mfa_challenge");
  cookieStore.delete("user_info");
}

export async function getTokens(): Promise<AuthTokens> {
  const cookieStore = await cookies();
  return {
    accessToken: cookieStore.get("access_token")?.value ?? null,
    refreshToken: cookieStore.get("refresh_token")?.value ?? null,
  };
}

export async function getCurrentOrg(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("current_org")?.value ?? null;
}

export async function getChallengeToken(): Promise<string | null> {
  const cookieStore = await cookies();
  return cookieStore.get("mfa_challenge")?.value ?? null;
}
