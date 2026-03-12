"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { Drone } from "@/lib/types";
import { statusDotClass, statusTextClass, getBatteryColor, headingToCompass } from "@/lib/drone-utils";
import { SummaryCard, SummaryCardGrid } from "@/components/dashboard/summary-card";

// ── Local helpers not yet in shared utils ─────────────────────────────────────

function rowAccentClass(status: Drone["status"]): string {
  if (status === "critical") return "border-l-2 border-l-fleet-red bg-fleet-red/[0.02]";
  if (status === "warning" || status === "rtb") return "border-l-2 border-l-fleet-amber bg-fleet-amber/[0.02]";
  return "border-l-2 border-l-transparent";
}

// ── Search / Filter bar ───────────────────────────────────────────────────────

type StatusFilter = "all" | Drone["status"];
type RoleFilter = "all" | Drone["role"];

interface FilterBarProps {
  search: string;
  onSearch: (v: string) => void;
  statusFilter: StatusFilter;
  onStatusFilter: (v: StatusFilter) => void;
  roleFilter: RoleFilter;
  onRoleFilter: (v: RoleFilter) => void;
  total: number;
  filtered: number;
}

function FilterBar({ search, onSearch, statusFilter, onStatusFilter, roleFilter, onRoleFilter, total, filtered }: FilterBarProps) {
  const t = useTranslations("fleetPage");

  const STATUS_FILTERS: { value: StatusFilter; label: string }[] = [
    { value: "all", label: t("filterAll") },
    { value: "nominal", label: t("filterNominal") },
    { value: "warning", label: t("filterWarning") },
    { value: "critical", label: t("filterCritical") },
    { value: "rtb", label: t("filterRtb") },
    { value: "offline", label: t("filterOffline") },
  ];

  const ROLE_FILTERS: { value: RoleFilter; label: string }[] = [
    { value: "all", label: t("filterAllRoles") },
    { value: "coordinator", label: t("filterCoord") },
    { value: "follower", label: t("filterFollower") },
    { value: "relay", label: t("filterRelay") },
  ];

  return (
    <div className="px-5 py-3 flex flex-wrap items-center gap-3 border-b border-border shrink-0">
      {/* Search input */}
      <div className="relative">
        <svg
          width="12"
          height="12"
          viewBox="0 0 12 12"
          fill="none"
          className="absolute left-2.5 top-1/2 -translate-y-1/2 text-subtle pointer-events-none"
        >
          <circle cx="5" cy="5" r="3.5" stroke="currentColor" strokeWidth="1.2" />
          <path d="M8 8l2.5 2.5" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        <input
          type="text"
          value={search}
          onChange={(e) => onSearch(e.target.value)}
          placeholder={t("searchPlaceholder")}
          className="bg-card border border-input rounded pl-7 pr-3 py-1.5 font-mono text-[11px] text-foreground placeholder:text-subtle focus:outline-none focus:border-muted w-44"
        />
      </div>

      {/* Status filters */}
      <div className="flex items-center gap-1">
        {STATUS_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onStatusFilter(f.value)}
            className={cn(
              "font-mono text-[10px] tracking-wider px-2 py-1 rounded border transition-colors",
              statusFilter === f.value
                ? "border-foreground/30 bg-secondary text-foreground"
                : "border-transparent text-subtle hover:text-muted-foreground hover:border-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Role filters */}
      <div className="flex items-center gap-1">
        {ROLE_FILTERS.map((f) => (
          <button
            key={f.value}
            onClick={() => onRoleFilter(f.value)}
            className={cn(
              "font-mono text-[10px] tracking-wider px-2 py-1 rounded border transition-colors",
              roleFilter === f.value
                ? "border-foreground/30 bg-secondary text-foreground"
                : "border-transparent text-subtle hover:text-muted-foreground hover:border-border"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Count indicator */}
      <div className="ml-auto font-mono text-[10px] text-subtle">
        {filtered === total ? (
          <span>{t("countAll", { total })}</span>
        ) : (
          <span>{t("countFiltered", { filtered, total })}</span>
        )}
      </div>
    </div>
  );
}

// ── Drone Table Row ───────────────────────────────────────────────────────────

interface DroneRowProps {
  drone: Drone;
  isSelected: boolean;
  onClick: () => void;
}

function DroneRow({ drone, isSelected, onClick }: DroneRowProps) {
  const t = useTranslations("fleetPage");
  const isAlert = drone.status === "warning" || drone.status === "critical" || drone.status === "rtb";
  const battery = getBatteryColor(drone.battery);

  const statusLabel: Record<Drone["status"], string> = {
    nominal: t("statusNominal"),
    warning: t("statusWarning"),
    critical: t("statusCritical"),
    rtb: t("statusRtb"),
    offline: t("statusOffline"),
  };

  const roleLabel: Record<Drone["role"], string> = {
    coordinator: t("roleCoord"),
    follower: t("roleFollower"),
    relay: t("roleRelay"),
  };

  return (
    <tr
      onClick={onClick}
      className={cn(
        "group cursor-pointer transition-colors",
        isSelected ? "bg-secondary" : "hover:bg-card",
        isAlert && !isSelected && rowAccentClass(drone.status)
      )}
    >
      {/* Status dot */}
      <td className="pl-5 pr-2 py-3 w-6">
        <div className={cn("w-[7px] h-[7px] rounded-full", statusDotClass[drone.status])} />
      </td>

      {/* Drone ID */}
      <td className="px-3 py-3">
        <span className="font-mono text-[12px] font-semibold text-foreground">{drone.id}</span>
      </td>

      {/* Role */}
      <td className="px-3 py-3">
        <span className="font-mono text-[10px] tracking-wider text-subtle">{roleLabel[drone.role]}</span>
      </td>

      {/* Status */}
      <td className="px-3 py-3">
        <span className={cn("font-mono text-[10px] tracking-wider font-semibold", statusTextClass[drone.status])}>
          {statusLabel[drone.status]}
        </span>
      </td>

      {/* Battery */}
      <td className="px-3 py-3">
        <div className="flex items-center gap-2">
          <div className="w-12 h-1.5 bg-secondary rounded-sm overflow-hidden shrink-0">
            <div
              className={cn("h-full rounded-sm transition-all", battery.bar)}
              style={{ width: `${drone.battery}%` }}
            />
          </div>
          <span className={cn("font-mono text-[11px] font-semibold tabular-nums", battery.text)}>
            {Math.round(drone.battery)}%
          </span>
        </div>
      </td>

      {/* Position */}
      <td className="px-3 py-3">
        <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
          {drone.position.lat.toFixed(5)}, {drone.position.lng.toFixed(5)}
        </span>
      </td>

      {/* Grid Pos */}
      <td className="px-3 py-3">
        <span className="font-mono text-[11px] text-muted-foreground">
          R{drone.gridPos.row}·C{drone.gridPos.col}
        </span>
      </td>

      {/* Heading */}
      <td className="pr-5 pl-3 py-3">
        <div className="flex items-center gap-1.5">
          {/* Compass arrow rotated to heading */}
          <svg
            width="12"
            height="12"
            viewBox="0 0 12 12"
            fill="none"
            className="text-subtle shrink-0"
            style={{ transform: `rotate(${drone.heading}deg)` }}
          >
            <path d="M6 1.5L8.5 10 6 8.5 3.5 10 6 1.5Z" fill="currentColor" />
          </svg>
          <span className="font-mono text-[11px] text-muted-foreground tabular-nums">
            {Math.round(drone.heading)}° {headingToCompass(drone.heading)}
          </span>
        </div>
      </td>
    </tr>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────

export default function FleetPage() {
  const t = useTranslations("fleetPage");

  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 5000 });

  const [selectedDroneId, setSelectedDroneId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all");
  const [roleFilter, setRoleFilter] = useState<RoleFilter>("all");

  // ── Derived stats ──
  const totalDrones = drones?.length ?? 0;
  const activeDrones = drones?.filter((d) => d.status !== "offline").length ?? 0;
  const warningDrones = drones?.filter((d) => d.status === "warning" || d.status === "critical").length ?? 0;
  const avgBattery =
    drones && drones.length > 0
      ? Math.round(drones.reduce((sum, d) => sum + d.battery, 0) / drones.length)
      : 0;

  // ── Filtered rows ──
  const filtered = useMemo(() => {
    const list = drones ?? [];
    return list.filter((d) => {
      const matchSearch =
        search.trim() === "" || d.id.toLowerCase().includes(search.toLowerCase());
      const matchStatus = statusFilter === "all" || d.status === statusFilter;
      const matchRole = roleFilter === "all" || d.role === roleFilter;
      return matchSearch && matchStatus && matchRole;
    });
  }, [drones, search, statusFilter, roleFilter]);

  // ── Sort: critical/warning first, then by id ──
  const sorted = useMemo(() => {
    const priority: Record<Drone["status"], number> = {
      critical: 0,
      warning: 1,
      rtb: 2,
      nominal: 3,
      offline: 4,
    };
    return [...filtered].sort((a, b) => priority[a.status] - priority[b.status] || a.id.localeCompare(b.id));
  }, [filtered]);

  const criticalAlerts = alerts?.filter((a) => a.severity === "critical").length ?? 0;
  const avgBatteryColor = getBatteryColor(avgBattery);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── Page header ── */}
      <div className="px-5 pt-4 pb-3 flex items-start justify-between shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">{t("title")}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {t("dronesRegistered", { count: totalDrones })}
            {mission && ` · ${mission.id} · ${mission.name} · ${Math.round(mission.coverage)}% coverage`}
          </div>
        </div>
        <div className="flex items-center gap-2">
          {criticalAlerts > 0 && (
            <div className="flex items-center gap-1.5 bg-fleet-red/10 border border-fleet-red/30 rounded px-2.5 py-1.5">
              <div className="w-[6px] h-[6px] rounded-full bg-fleet-red shadow-[0_0_4px_#ef444488]" />
              <span className="font-mono text-[10px] tracking-wider text-fleet-red uppercase">
                {criticalAlerts !== 1
                  ? t("criticalAlerts", { count: criticalAlerts })
                  : t("criticalAlert", { count: criticalAlerts })}
              </span>
            </div>
          )}
          <div className="flex items-center gap-1.5 bg-card border border-input rounded px-2.5 py-1.5">
            <div className="w-[6px] h-[6px] rounded-full bg-fleet-green shadow-[0_0_4px_#22c55e88]" />
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("liveRefresh")}</span>
          </div>
        </div>
      </div>

      {/* ── Summary cards ── */}
      <SummaryCardGrid>
        <SummaryCard
          label={t("totalDrones")}
          value={totalDrones}
          meta={
            <>
              <span className="text-muted-foreground">{t("offlineMeta", { count: drones?.filter((d) => d.status === "offline").length ?? 0 })}</span>
            </>
          }
        />
        <SummaryCard
          label={t("active")}
          value={activeDrones}
          valueColor="text-fleet-green"
          meta={
            <>
              <span className="text-fleet-green">●</span>
              {` ${t("nominalMeta", { count: drones?.filter((d) => d.status === "nominal").length ?? 0 })}`}
            </>
          }
        />
        <SummaryCard
          label={t("warnings")}
          value={warningDrones}
          valueColor={warningDrones > 0 ? "text-fleet-amber" : "text-foreground"}
          meta={
            warningDrones > 0 ? (
              <>
                <span className="text-fleet-amber">⚠</span>
                {` ${t("criticalMeta", { count: drones?.filter((d) => d.status === "critical").length ?? 0 })}`}
              </>
            ) : (
              <>
                <span className="text-fleet-green">●</span> {t("allClear")}
              </>
            )
          }
        />
        <SummaryCard
          label={t("avgBattery")}
          value={avgBattery}
          unit="%"
          valueColor={avgBatteryColor.text}
          meta={
            <>
              <span className={avgBattery > 50 ? "text-fleet-green" : "text-fleet-amber"}>
                {avgBattery > 50 ? "●" : "⚠"}
              </span>
              {` ${t("meshLinksMeta", { count: meshLinks?.length ?? 0 })}`}
            </>
          }
        />
      </SummaryCardGrid>

      {/* ── Filter bar ── */}
      <FilterBar
        search={search}
        onSearch={setSearch}
        statusFilter={statusFilter}
        onStatusFilter={setStatusFilter}
        roleFilter={roleFilter}
        onRoleFilter={setRoleFilter}
        total={totalDrones}
        filtered={sorted.length}
      />

      {/* ── Table ── */}
      <div className="flex-1 overflow-y-auto min-h-0">
        <table className="w-full border-collapse">
          <thead className="sticky top-0 z-10 bg-background">
            <tr className="border-b border-border">
              <th className="pl-5 pr-2 py-2 w-6" />
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colDroneId")}</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colRole")}</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colStatus")}</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colBattery")}</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colPosition")}</span>
              </th>
              <th className="px-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colGridPos")}</span>
              </th>
              <th className="pr-5 pl-3 py-2 text-left">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("colHeading")}</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {sorted.length === 0 && (
              <tr>
                <td colSpan={8} className="text-center py-16 font-mono text-[12px] text-subtle">
                  {drones === undefined ? t("loadingDrones") : t("noMatch")}
                </td>
              </tr>
            )}
            {sorted.map((drone) => (
              <DroneRow
                key={drone.id}
                drone={drone}
                isSelected={selectedDroneId === drone.id}
                onClick={() => setSelectedDroneId(selectedDroneId === drone.id ? null : drone.id)}
              />
            ))}
          </tbody>
        </table>

        {/* ── Selected drone detail panel ── */}
        {selectedDroneId && (() => {
          const drone = drones?.find((d) => d.id === selectedDroneId);
          if (!drone) return null;
          const droneAlerts = alerts?.filter((a) => a.droneId === drone.id) ?? [];
          const droneBattery = getBatteryColor(drone.battery);

          const statusLabel: Record<Drone["status"], string> = {
            nominal: t("statusNominal"),
            warning: t("statusWarning"),
            critical: t("statusCritical"),
            rtb: t("statusRtb"),
            offline: t("statusOffline"),
          };

          const roleLabel: Record<Drone["role"], string> = {
            coordinator: t("roleCoord"),
            follower: t("roleFollower"),
            relay: t("roleRelay"),
          };

          return (
            <div className="mx-5 my-4 bg-card border border-border rounded p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <div className={cn("w-[7px] h-[7px] rounded-full", statusDotClass[drone.status])} />
                  <span className="font-mono text-[13px] font-semibold text-foreground">{drone.id}</span>
                  <span className="font-mono text-[10px] tracking-wider text-subtle uppercase ml-1">
                    {roleLabel[drone.role]}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedDroneId(null)}
                  className="font-mono text-[10px] text-subtle hover:text-muted-foreground transition-colors"
                >
                  {t("detailClose")}
                </button>
              </div>

              <div className="grid grid-cols-4 gap-px bg-border border border-border rounded overflow-hidden">
                {[
                  { label: t("detailStatus"), value: statusLabel[drone.status], color: statusTextClass[drone.status] },
                  { label: t("detailBattery"), value: `${Math.round(drone.battery)}%`, color: droneBattery.text },
                  { label: t("detailHeading"), value: `${Math.round(drone.heading)}° ${headingToCompass(drone.heading)}`, color: "text-foreground" },
                  { label: t("detailGrid"), value: `R${drone.gridPos.row}·C${drone.gridPos.col}`, color: "text-foreground" },
                ].map((item) => (
                  <div key={item.label} className="bg-card px-3 py-2.5">
                    <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-1">{item.label}</div>
                    <div className={cn("font-mono text-[13px] font-semibold", item.color)}>{item.value}</div>
                  </div>
                ))}
              </div>

              <div className="mt-3 font-mono text-[11px] text-subtle">
                <span className="uppercase tracking-wider">{t("detailPosition")}</span>
                <span className="text-muted-foreground ml-2 tabular-nums">
                  {drone.position.lat.toFixed(6)}, {drone.position.lng.toFixed(6)}
                </span>
              </div>

              {droneAlerts.length > 0 && (
                <div className="mt-3 space-y-1.5">
                  <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-2">{t("detailActiveAlerts")}</div>
                  {droneAlerts.map((alert) => (
                    <div
                      key={alert.id}
                      className={cn(
                        "flex items-start gap-2 px-3 py-2 rounded border",
                        alert.severity === "critical"
                          ? "bg-fleet-red/5 border-fleet-red/20"
                          : alert.severity === "warning"
                          ? "bg-fleet-amber/5 border-fleet-amber/20"
                          : "bg-fleet-blue/5 border-fleet-blue/20"
                      )}
                    >
                      <span
                        className={cn(
                          "font-mono text-[10px] mt-px",
                          alert.severity === "critical"
                            ? "text-fleet-red"
                            : alert.severity === "warning"
                            ? "text-fleet-amber"
                            : "text-fleet-blue"
                        )}
                      >
                        {alert.severity === "critical" ? "●" : alert.severity === "warning" ? "⚠" : "ℹ"}
                      </span>
                      <div className="min-w-0">
                        <div className="font-mono text-[11px] font-semibold text-foreground">{alert.title}</div>
                        <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{alert.detail}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })()}
      </div>
    </div>
  );
}
