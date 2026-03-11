"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

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

  return (
    <header className="h-11 border-b border-border bg-card flex items-center px-4 shrink-0">
      {/* Logo */}
      <div className="font-mono text-[13px] font-semibold tracking-wider text-foreground uppercase pr-5 border-r border-input mr-5">
        {tc("appName")} <span className="text-subtle font-light">/ {tc("appSuffix")}</span>
      </div>

      {/* Org selector */}
      <button className="flex items-center gap-1.5 text-xs text-muted-foreground px-2.5 py-1 border border-input rounded-[5px] font-mono hover:border-muted hover:text-foreground transition-colors">
        <span className="w-1.5 h-1.5 rounded-full bg-fleet-blue" />
        Bravo Team
        <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
          <path d="M2.5 4L5 6.5L7.5 4" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
      </button>

      {/* Nav */}
      <nav className="flex gap-0.5 ml-4">
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
        <div className="flex items-center gap-1.5 font-mono text-[11px] text-fleet-green px-2 py-0.5 bg-fleet-green-dim border border-fleet-green/15 rounded-full">
          <span className="w-[5px] h-[5px] rounded-full bg-fleet-green animate-pulse" />
          BASE-01 {tc("online")}
        </div>
        <div className="w-[26px] h-[26px] rounded-full bg-gradient-to-br from-[#1e3a5f] to-fleet-blue border border-input flex items-center justify-center text-[10px] font-semibold text-white cursor-pointer">
          DK
        </div>
      </div>
    </header>
  );
}
