import { cookies } from "next/headers";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";
import { MobileTabBar } from "@/components/layout/mobile-tab-bar";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const cookieStore = await cookies();
  const currentOrg = cookieStore.get("current_org")?.value ?? null;
  const currentOrgName = cookieStore.get("current_org_name")?.value ?? null;
  const userInfoRaw = cookieStore.get("user_info")?.value;
  let userInitials = "--";
  let userDisplayName: string | null = null;
  let userAvatarUrl: string | null = null;
  if (userInfoRaw) {
    try {
      const info = JSON.parse(userInfoRaw) as { initials?: string; displayName?: string; avatarUrl?: string };
      if (info.initials) userInitials = info.initials;
      if (info.displayName) userDisplayName = info.displayName;
      if (info.avatarUrl) userAvatarUrl = info.avatarUrl;
    } catch {
      // leave defaults
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
