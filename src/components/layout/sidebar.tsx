"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { trpc } from "@/lib/trpc/client";

interface SidebarItem {
  label: string;
  href: string;
  icon: React.ReactNode;
  badge?: { value: string | number; variant: "green" | "red" | "amber" | "muted" };
}

function SidebarIcon({ d }: { d: string }) {
  return (
    <svg className="w-3.5 h-3.5 opacity-60 shrink-0" viewBox="0 0 14 14" fill="none">
      <path d={d} stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

const badgeVariants = {
  green: "bg-fleet-green-dim text-fleet-green border-fleet-green/15",
  red: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
  amber: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  muted: "bg-border2 text-subtle",
} as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("sidebar");

  // Live badge data
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });

  const droneCount = drones?.length ?? 0;
  const alertCount = alerts?.filter((a) => a.severity !== "info").length ?? 0;
  const activeMissions = 1;

  const sections: { label: string; items: SidebarItem[] }[] = [
    {
      label: t("active"),
      items: [
        { label: t("overview"), href: "/", icon: <SidebarIcon d="M4 7h6M7 4v6" /> },
        {
          label: t("liveMission"),
          href: "/missions",
          icon: <SidebarIcon d="M7 4.5v3l1.5 1.5" />,
          badge: { value: activeMissions, variant: "green" },
        },
        { label: t("map"), href: "#", icon: <SidebarIcon d="M2 11L5 6l2.5 3L9 7l3 4H2z" /> },
      ],
    },
    {
      label: t("manage"),
      items: [
        {
          label: t("drones"),
          href: "/fleet",
          icon: <SidebarIcon d="M7 1L9 5h4L10 8l1 4-4-2.5L3 12l1-4L1 5h4z" />,
          badge: { value: droneCount, variant: "muted" },
        },
        {
          label: t("baseStations"),
          href: "/bases",
          icon: <SidebarIcon d="M5 4V3a2 2 0 014 0v1" />,
          badge: { value: 2, variant: "green" },
        },
        { label: t("missionPlans"), href: "#", icon: <SidebarIcon d="M4.5 6.5h5M4.5 8.5h3" /> },
      ],
    },
    {
      label: t("system"),
      items: [
        {
          label: t("alerts"),
          href: "#",
          icon: <SidebarIcon d="M7 1v2M7 11v2M1 7h2M11 7h2" />,
          badge: alertCount > 0 ? { value: alertCount, variant: "amber" } : undefined,
        },
        { label: t("auditLog"), href: "/audit", icon: <SidebarIcon d="M2 4h10M2 7h10M2 10h6" /> },
        { label: t("settings"), href: "#", icon: <SidebarIcon d="M7 4.5v3M7 9.5v.5" /> },
      ],
    },
  ];

  return (
    <aside className="w-[200px] border-r border-border bg-surface flex flex-col shrink-0 py-3">
      {sections.map((section) => (
        <div key={section.label} className="px-2 mb-5">
          <div className="font-mono text-[10px] tracking-widest text-subtle uppercase px-2 mb-1">
            {section.label}
          </div>
          {section.items.map((item) => {
            const isActive =
              item.href === "/" ? pathname === "/" : pathname.startsWith(item.href);
            return (
              <Link
                key={item.label}
                href={item.href}
                className={cn(
                  "flex items-center gap-2 px-2 py-1.5 rounded-[5px] cursor-pointer text-text-dim text-[12.5px] transition-colors relative",
                  isActive && "bg-border2 text-text",
                  !isActive && "hover:bg-border hover:text-text"
                )}
              >
                {isActive && (
                  <span className="absolute left-0 top-1 bottom-1 w-0.5 bg-text rounded-r" />
                )}
                {item.icon}
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
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-[5px] text-text-dim text-[12.5px] cursor-pointer hover:bg-border hover:text-text">
          <SidebarIcon d="M7 1a6 6 0 100 12A6 6 0 007 1z" />
          {t("firmware")}
          <span className="ml-auto font-mono text-[10px] px-1.5 py-px rounded-sm bg-border2 text-subtle">
            v2.4
          </span>
        </div>
      </div>
    </aside>
  );
}
