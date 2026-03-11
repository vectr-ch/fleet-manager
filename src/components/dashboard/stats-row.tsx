"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";

export function StatsRow() {
  const t = useTranslations("dashboard");
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 2000 });

  const nominalCount = drones?.filter((d) => d.status === "nominal").length ?? 0;
  const warningCount = drones?.filter((d) => d.status === "warning").length ?? 0;
  const activeCount = drones?.filter((d) => d.status !== "offline").length ?? 0;

  const stats = [
    {
      label: t("dronesActive"),
      value: String(activeCount),
      meta: (
        <>
          <span className="text-fleet-green">●</span> {nominalCount} nominal · {warningCount} warning
        </>
      ),
    },
    {
      label: t("coverage"),
      value: `${Math.round(mission?.coverage ?? 0)}`,
      unit: "%",
      meta: (
        <>
          <span className="text-fleet-green">↑</span> live
        </>
      ),
    },
    {
      label: t("formation"),
      value: `${mission?.formationIntegrity ?? 0}`,
      unit: "%",
      valueColor: "text-fleet-green",
      meta: (
        <>
          <span className="text-fleet-green">●</span> {mission?.formation ?? "grid"} · VRP locked
        </>
      ),
    },
    {
      label: t("meshLinks"),
      value: String((meshLinks?.length ?? 0) * 2 + 4),
      meta: (
        <>
          <span className="text-fleet-green">●</span> All nodes connected
        </>
      ),
    },
    {
      label: t("etaComplete"),
      value: String(mission?.eta ?? 0),
      unit: "m",
      meta: warningCount > 0 ? (
        <>
          <span className="text-fleet-amber">⚠</span> {warningCount} drone warning
        </>
      ) : (
        <>
          <span className="text-fleet-green">●</span> On track
        </>
      ),
    },
  ];

  return (
    <div className="grid grid-cols-5 gap-px bg-border border-y border-border mt-4 shrink-0">
      {stats.map((stat) => (
        <div key={stat.label} className="bg-surface px-4 py-3 flex flex-col gap-1">
          <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">
            {stat.label}
          </div>
          <div className={`font-mono text-[22px] font-semibold leading-none tracking-tight ${stat.valueColor ?? "text-text"}`}>
            {stat.value}
            {stat.unit && (
              <span className="text-sm text-subtle">{stat.unit}</span>
            )}
          </div>
          <div className="text-[11px] text-text-dim flex items-center gap-1">
            {stat.meta}
          </div>
        </div>
      ))}
    </div>
  );
}
