"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

const navItems = [
  { href: "/overview", key: "overview" },
  { href: "/missions", key: "missions" },
  { href: "/fleet", key: "fleet" },
  { href: "/bases", key: "bases" },
  { href: "/telemetry", key: "telemetry" },
  { href: "/audit", key: "audit" },
] as const;

export function Topbar() {
  const pathname = usePathname();
  const t = useTranslations("topbar");
  const tc = useTranslations("common");

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
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1e3a5f] to-fleet-blue border border-input flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer">
          DK
        </div>
        <button
          onClick={() => logoutMutation.mutate()}
          disabled={logoutMutation.isPending}
          className="text-xs text-muted-foreground px-2.5 py-1 rounded font-mono tracking-wide transition-colors hover:text-foreground hover:bg-border disabled:opacity-50"
        >
          {logoutMutation.isPending ? "..." : "Logout"}
        </button>
      </div>
    </header>
  );
}
