"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { OrgSwitcher } from "@/components/layout/org-switcher";

const navItems = [
  { href: "/overview", key: "overview" },
  { href: "/fleet", key: "fleet" },
  { href: "/bases", key: "bases" },
] as const;

interface TopbarProps {
  currentOrg: string | null;
  currentOrgName: string | null;
  userInitials: string;
}

export function Topbar({ currentOrg, currentOrgName, userInitials }: TopbarProps) {
  const pathname = usePathname();
  const router = useRouter();
  const t = useTranslations("topbar");
  const tc = useTranslations("common");

  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/login";
    },
  });

  // Org list for mobile switcher
  const orgsQuery = trpc.userAccount.listOrgs.useQuery();
  const switchOrgMutation = trpc.userAccount.updateDefaultOrg.useMutation({
    onSuccess: () => router.refresh(),
  });

  return (
    <header className="h-11 border-b border-border bg-card flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold tracking-wider text-foreground uppercase pr-5 md:border-r md:border-input md:mr-5">
        {tc("appName")} <span className="text-subtle font-light">/ {tc("appSuffix")}</span>
      </div>

      {/* Nav — hidden on mobile */}
      <nav className="hidden md:flex gap-0.5">
        {navItems.map((item) => {
          const isActive = pathname.startsWith(item.href);
          return (
            <Link
              key={item.key}
              href={item.href}
              className={cn(
                "text-xs text-muted-foreground px-2.5 py-1 rounded font-mono tracking-wide transition-colors",
                isActive && "text-foreground bg-secondary",
                !isActive && "hover:text-foreground hover:bg-border"
              )}
            >
              {t(item.key)}
            </Link>
          );
        })}
      </nav>

      {/* Right side */}
      <div className="ml-auto flex items-center gap-2.5">
        {/* Org badge — hidden on mobile */}
        {currentOrg && (
          <div className="hidden md:block" onClick={() => setUserDropdownOpen(false)}>
            <OrgSwitcher currentOrg={currentOrg} currentOrgName={currentOrgName} />
          </div>
        )}

        {/* Divider — hidden on mobile */}
        <div className="hidden md:block w-px h-5 bg-border" />

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(v => !v)}
            className="w-6.5 h-6.5 rounded-full bg-linear-to-br from-[#1e3a5f] to-fleet-blue border border-input flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer"
          >
            {userInitials}
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-1100 w-52 rounded-lg border border-[#252525] bg-[#181818] py-1.5 shadow-2xl" onMouseLeave={() => setUserDropdownOpen(false)}>
              {/* Org switcher — mobile only */}
              {currentOrg && (
                <div className="md:hidden border-b border-[#252525] pb-1.5 mb-1.5">
                  <div className="font-mono text-[9px] tracking-[.06em] text-[#555] uppercase px-3.5 pt-1 pb-1.5">Organisation</div>
                  {orgsQuery.data?.map((org) => (
                    <button
                      key={org.id}
                      onClick={() => {
                        if (org.slug !== currentOrg) {
                          switchOrgMutation.mutate({ orgId: org.id, orgSlug: org.slug, orgName: org.name });
                        }
                        setUserDropdownOpen(false);
                      }}
                      className={cn(
                        "block w-full text-left px-3.5 py-1.5 text-xs transition-colors",
                        org.slug === currentOrg
                          ? "text-fleet-green font-medium"
                          : "text-[#888] active:bg-[#ffffff08]"
                      )}
                    >
                      {org.name}
                    </button>
                  )) ?? (
                    <div className="px-3.5 py-1.5 text-xs text-foreground font-medium truncate">{currentOrgName ?? currentOrg}</div>
                  )}
                </div>
              )}
              <Link href="/settings" className="block px-3.5 py-2 text-xs text-[#888] hover:text-foreground active:bg-[#ffffff08] transition-colors" onClick={() => setUserDropdownOpen(false)}>
                Settings
              </Link>
              <button
                onClick={() => { setUserDropdownOpen(false); logoutMutation.mutate(); }}
                disabled={logoutMutation.isPending}
                className="block w-full text-left px-3.5 py-2 text-xs text-red-400 active:bg-[#ffffff08] disabled:opacity-50 transition-colors"
              >
                {logoutMutation.isPending ? "..." : "Sign out"}
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
