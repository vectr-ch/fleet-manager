import { cookies } from "next/headers";
import { Topbar } from "@/components/layout/topbar";
import { Sidebar } from "@/components/layout/sidebar";

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
  if (userInfoRaw) {
    try {
      const { initials } = JSON.parse(userInfoRaw) as { initials?: string };
      if (initials) userInitials = initials;
    } catch {
      // leave default
    }
  }

  return (
    <div className="flex flex-col h-screen overflow-hidden">
      <Topbar currentOrg={currentOrg} currentOrgName={currentOrgName} userInitials={userInitials} />
      <div className="flex flex-1 overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col overflow-hidden min-h-0">
          {children}
        </main>
      </div>
    </div>
  );
}
