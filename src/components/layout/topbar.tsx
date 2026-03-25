"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";
import { OrgSwitcher } from "@/components/layout/org-switcher";

const navItems = [
  { href: "/overview", key: "overview" },
  { href: "/missions", key: "missions" },
  { href: "/fleet", key: "fleet" },
  { href: "/bases", key: "bases" },
  { href: "/telemetry", key: "telemetry" },
  { href: "/audit", key: "audit" },
] as const;

function parseClientCookie(name: string): string | null {
  if (typeof document === "undefined") return null;
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]*)"));
  return match ? decodeURIComponent(match[1]) : null;
}

function deriveInitials(email: string): string {
  const local = email.split("@")[0];
  const lastDot = local.lastIndexOf(".");
  if (lastDot > 0 && lastDot < local.length - 1) {
    return (local[0] + local[lastDot + 1]).toUpperCase();
  }
  return local.slice(0, 2).toUpperCase();
}

export function Topbar() {
  const pathname = usePathname();
  const t = useTranslations("topbar");
  const tc = useTranslations("common");

  const [currentOrg, setCurrentOrg] = useState<string | null>(null);
  const [userInitials, setUserInitials] = useState<string>("--");
  const [userDropdownOpen, setUserDropdownOpen] = useState(false);

  useEffect(() => {
    setCurrentOrg(parseClientCookie("current_org"));
    const raw = parseClientCookie("user_info");
    if (raw) {
      try {
        const { email } = JSON.parse(raw);
        if (email) setUserInitials(deriveInitials(email));
      } catch {
        // leave default
      }
    }
  }, []);

  const logoutMutation = trpc.auth.logout.useMutation({
    onSuccess: () => {
      window.location.href = "/login";
    },
  });

  return (
    <header className="h-11 border-b border-border bg-card flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold tracking-wider text-foreground uppercase pr-5 border-r border-input mr-5">
        {tc("appName")} <span className="text-subtle font-light">/ {tc("appSuffix")}</span>
      </div>

      {/* Nav */}
      <nav className="flex gap-0.5">
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
        {/* Org badge with switcher */}
        {currentOrg && (
          <div onClick={() => setUserDropdownOpen(false)}>
            <OrgSwitcher currentOrg={currentOrg} />
          </div>
        )}

        {/* Divider */}
        <div className="w-px h-5 bg-border" />

        {/* User avatar */}
        <div className="relative">
          <button
            onClick={() => setUserDropdownOpen(v => !v)}
            className="w-[26px] h-[26px] rounded-full bg-linear-to-br from-[#1e3a5f] to-fleet-blue border border-input flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer"
          >
            {userInitials}
          </button>
          {userDropdownOpen && (
            <div className="absolute right-0 top-full mt-1 z-50 w-40 rounded-md border border-border bg-card py-1 shadow-lg" onMouseLeave={() => setUserDropdownOpen(false)}>
              <Link href="/settings" className="block px-3 py-2 text-xs text-muted-foreground hover:text-foreground hover:bg-secondary" onClick={() => setUserDropdownOpen(false)}>
                Settings
              </Link>
              <button
                onClick={() => { setUserDropdownOpen(false); logoutMutation.mutate(); }}
                disabled={logoutMutation.isPending}
                className="block w-full text-left px-3 py-2 text-xs text-red-400 hover:bg-secondary disabled:opacity-50"
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
