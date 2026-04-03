"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: { value: string | number; variant: "green" | "red" | "amber" | "muted" };
}

const badgeVariants = {
  green: "bg-fleet-green-dim text-fleet-green border-fleet-green/15",
  red: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
  amber: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  muted: "bg-secondary text-subtle",
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  const sections: { label: string; items: SidebarItem[] }[] = [
    {
      label: t("active"),
      items: [
        {
          label: t("overview"),
          href: "/overview",
          icon: (
            <svg viewBox="0 0 14 14" fill="none">
              <rect x="1" y="1" width="12" height="12" rx="1.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M4 7h6M7 4v6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          ),
        },
        {
          label: t("map"),
          href: "/map",
          icon: (
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M2 11L5 6l2.5 3L9 7l3 4H2z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
              <circle cx="10" cy="3.5" r="1.5" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ),
        },
        {
          label: t("telemetry"),
          href: "/telemetry",
          icon: (
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M1 10l3-4 2.5 2L9 4l3.5 6" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          ),
        },
      ],
    },
    {
      label: t("manage"),
      items: [
        {
          label: t("drones"),
          href: "/fleet",
          icon: (
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M7 1L9 5h4L10 8l1 4-4-2.5L3 12l1-4L1 5h4z" stroke="currentColor" strokeWidth="1.2" strokeLinejoin="round" />
            </svg>
          ),
        },
        {
          label: t("baseStations"),
          href: "/bases",
          icon: (
            <svg viewBox="0 0 14 14" fill="none">
              <rect x="2" y="4" width="10" height="7" rx="1" stroke="currentColor" strokeWidth="1.2" />
              <path d="M5 4V3a2 2 0 014 0v1" stroke="currentColor" strokeWidth="1.2" />
            </svg>
          ),
        },
      ],
    },
  ];

  return (
    <aside className="w-[200px] border-r border-border bg-card flex flex-col shrink-0 py-3">
      {sections.map((section) => (
        <div key={section.label} className="px-2 mb-5">
          <div className="font-mono text-[10px] tracking-widest text-subtle uppercase px-2 mb-1">
            {section.label}
          </div>
          {section.items.map((item) => {
            const isActive =
              item.href === "/overview" ? pathname === "/overview" || pathname === "/" : pathname.startsWith(item.href) && item.href !== "#";
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-[5px] cursor-pointer text-muted-foreground text-[12.5px] transition-colors relative",
                  isActive && "bg-secondary text-foreground",
                  !isActive && "hover:bg-border hover:text-foreground"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-foreground rounded-r" />
                )}
                <span className={cn("w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full", isActive ? "opacity-100" : "opacity-60")}>
                  {item.icon}
                </span>
                {item.label}
                {item.badge && (
                  <span
                    className={cn(
                      "ml-auto font-mono text-[10px] px-1.5 py-px rounded-sm font-medium border",
                      badgeVariants[item.badge.variant]
                    )}
                  >
                    {item.badge.value}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      ))}

      {/* Bottom */}
      <div className="mt-auto pt-2 px-2 border-t border-border">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-2 px-2 py-1.5 rounded-[5px] cursor-pointer text-muted-foreground text-[12.5px] transition-colors relative",
            pathname.startsWith("/settings") && "bg-secondary text-foreground",
            !pathname.startsWith("/settings") && "hover:bg-border hover:text-foreground"
          )}
        >
          {pathname.startsWith("/settings") && (
            <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-foreground rounded-r" />
          )}
          <span className={cn("w-3.5 h-3.5 shrink-0 [&>svg]:w-full [&>svg]:h-full", pathname.startsWith("/settings") ? "opacity-100" : "opacity-60")}>
            <svg viewBox="0 0 14 14" fill="none">
              <circle cx="7" cy="5" r="2.5" stroke="currentColor" strokeWidth="1.2" />
              <path d="M2.5 13a4.5 4.5 0 019 0" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
            </svg>
          </span>
          {t("account")}
        </Link>
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-muted-foreground text-[12.5px]">
          <span className="w-3.5 h-3.5 shrink-0 opacity-60 [&>svg]:w-full [&>svg]:h-full">
            <svg viewBox="0 0 14 14" fill="none">
              <path d="M7 1a6 6 0 100 12A6 6 0 007 1zm0 0v6m0 0l3-3M7 7l-3-3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
          {t("firmware")}
          <span className="ml-auto font-mono text-[10px] px-1.5 py-px rounded-sm bg-fleet-green-dim text-fleet-green border border-fleet-green/15">
            v1.0
          </span>
        </div>
      </div>
    </aside>
  );
}
