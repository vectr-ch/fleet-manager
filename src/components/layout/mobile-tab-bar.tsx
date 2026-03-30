"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { useState } from "react";
import { MoreDrawer } from "./more-drawer";

const tabs = [
  {
    key: "map",
    href: "/map",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M3 14L6 8l3 4 2-2.5L14 14H3z" strokeLinejoin="round" />
        <circle cx="13" cy="4.5" r="2" />
      </svg>
    ),
  },
  {
    key: "fleet",
    href: "/fleet",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 2L11.5 6.5h5L13 10l1.5 5L9 12 3.5 15 5 10 1.5 6.5h5z" strokeLinejoin="round" />
      </svg>
    ),
  },
  {
    key: "bases",
    href: "/bases",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <rect x="3" y="5" width="12" height="9" rx="1.5" />
        <path d="M6.5 5V3.5a2.5 2.5 0 015 0V5" />
      </svg>
    ),
  },
  {
    key: "alerts",
    href: "/alerts",
    icon: (
      <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3">
        <path d="M9 2L2 15h14L9 2z" strokeLinejoin="round" />
        <path d="M9 7v3.5M9 12.5v.5" strokeLinecap="round" />
      </svg>
    ),
    badge: true,
  },
] as const;

export function MobileTabBar() {
  const pathname = usePathname();
  const t = useTranslations("mobileNav");
  const [drawerOpen, setDrawerOpen] = useState(false);

  const morePages = ["/overview", "/missions", "/telemetry", "/audit", "/settings"];
  const moreActive = morePages.some((p) => pathname.startsWith(p));

  return (
    <>
      <nav className="h-14 bg-[#0f0f0f] border-t border-[#1a1a1a] grid grid-cols-5 items-center shrink-0 md:hidden">
        {tabs.map((tab) => {
          const isActive = tab.href === "/map"
            ? pathname === "/map" || pathname === "/"
            : pathname.startsWith(tab.href);

          return (
            <Link
              key={tab.key}
              href={tab.href}
              className={cn(
                "flex flex-col items-center gap-0.5 py-1",
                isActive ? "text-foreground" : "text-[#444]",
              )}
            >
              <span className="w-5 h-5 relative">
                {tab.icon}
              </span>
              <span className={cn("font-mono text-[9px] tracking-wide", isActive && "font-medium")}>
                {t(tab.key)}
              </span>
            </Link>
          );
        })}

        <button
          onClick={() => setDrawerOpen(true)}
          className={cn(
            "flex flex-col items-center gap-0.5 py-1",
            moreActive || drawerOpen ? "text-foreground" : "text-[#444]",
          )}
        >
          <span className="w-5 h-5">
            <svg viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.3" strokeLinecap="round">
              <line x1="3" y1="5" x2="15" y2="5" />
              <line x1="3" y1="9" x2="15" y2="9" />
              <line x1="3" y1="13" x2="15" y2="13" />
            </svg>
          </span>
          <span className={cn("font-mono text-[9px] tracking-wide", (moreActive || drawerOpen) && "font-medium")}>
            {t("more")}
          </span>
        </button>
      </nav>

      <MoreDrawer open={drawerOpen} onClose={() => setDrawerOpen(false)} />
    </>
  );
}
