import { cookies } from "next/headers";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";
import { getTokens } from "@/lib/auth/cookies";
import { decodeJwtPayload } from "@/lib/auth/refresh";
import { fmsFetch } from "@/lib/fms";
import type { UserProfile } from "@/lib/types";

function deriveInitials(email: string): string {
  const local = email.split("@")[0];
  const dot = local.lastIndexOf(".");
  if (dot > 0 && dot < local.length - 1) return (local[0] + local[dot + 1]).toUpperCase();
  return local.slice(0, 2).toUpperCase();
}

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const currentOrg = cookieStore.get("current_org")?.value ?? null;
  const currentOrgName = cookieStore.get("current_org_name")?.value ?? null;

  // Fetch user profile server-side so avatar/name are available on first paint.
  let userInitials = "--";
  let userDisplayName: string | null = null;
  let userAvatarUrl: string | null = null;

  try {
    // Read the access token directly — do NOT call ensureValidToken() here.
    // Server Components cannot write cookies (cookies().set() silently fails),
    // so triggering a refresh would consume the single-use refresh token in
    // Valkey without persisting the new tokens, destroying the session.
    // Token refresh is handled by tRPC procedure middleware (API route handlers)
    // where cookies().set() works correctly.
    const { accessToken } = await getTokens();
    if (accessToken) {
      const { sub } = decodeJwtPayload(accessToken);
      if (sub) {
        const profile = await fmsFetch<UserProfile>(`/users/${sub}`, { accessToken });
        userInitials = deriveInitials(profile.email);
        userDisplayName = profile.display_name ?? null;
        userAvatarUrl = profile.avatar_url ?? null;
      }
    }
  } catch {
    // Fall back to cookie-based initials if FMS is unreachable.
    const userInfoRaw = cookieStore.get("user_info")?.value;
    if (userInfoRaw) {
      try {
        const info = JSON.parse(userInfoRaw) as { initials?: string };
        if (info.initials) userInitials = info.initials;
      } catch {
        // leave defaults
      }
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar
        currentOrg={currentOrg}
        currentOrgName={currentOrgName}
        userInitials={userInitials}
        userDisplayName={userDisplayName}
        userAvatarUrl={userAvatarUrl}
      />
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar — hidden on mobile */}
        <div className="hidden md:flex shrink-0">
          <Sidebar />
        </div>
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </main>
      </div>
      {/* Mobile bottom tab bar — hidden on desktop */}
      <MobileTabBar />
    </div>
  );
}
