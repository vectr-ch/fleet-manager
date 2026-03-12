"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import {
  statusDotClass,
  statusTextClass,
  statusBgClass,
  getBatteryColor,
} from "@/lib/drone-utils";
import {
  SummaryCard,
  SummaryCardGrid,
} from "@/components/dashboard/summary-card";
import { cn } from "@/lib/utils";
import { REFETCH_INTERVAL } from "@/lib/constants";

// ── Local UI components ───────────────────────────────────────────────────────

function BatteryBar({ value }: { value: number }) {
  const { bar, text } = getBatteryColor(value);
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${bar}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`font-mono text-[10px] font-semibold ${text}`}>
        {value}%
      </span>
    </div>
  );
}

function MetricRow({ label, value, valueClass = "text-foreground" }: { label: string; value: string | number; valueClass?: string }) {
  return (
    <div className="flex items-center justify-between py-1.5 border-b border-border last:border-0">
      <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{label}</span>
      <span className={`font-mono text-sm font-semibold ${valueClass}`}>{value}</span>
    </div>
  );
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="bg-card border border-border rounded-[5px] overflow-hidden">
      <div className="px-3 py-2 border-b border-border bg-secondary/30">
        <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{title}</span>
      </div>
      <div className="px-3 py-2">{children}</div>
    </div>
  );
}

// ── Telemetry Page ────────────────────────────────────────────────────────────
export default function TelemetryPage() {
  const t = useTranslations("telemetryPage");

  const { data: drones = [] } = trpc.drones.list.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.REALTIME });
  const { data: meshLinks = [] } = trpc.meshLinks.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.SLOW });
  const { data: baseStations = [] } = trpc.baseStations.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.SLOW });
  const { data: systemMetrics } = trpc.telemetry.systemMetrics.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.MEDIUM });
  const { data: environment } = trpc.telemetry.environment.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.SLOW });
  const { data: meshNetworkHealth } = trpc.meshNetworkHealth.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.SLOW });

  const activeCount = drones.filter((d) => d.status === "nominal" || d.status === "warning").length;
  const criticalCount = drones.filter((d) => d.status === "critical").length;
  const offlineCount = drones.filter((d) => d.status === "offline").length;
  const meshNodeCount = meshLinks.length;
  const uplinkOnline = baseStations.some((b) => b.status === "online");

  // system clock
  const now = new Date();
  const clockStr = now.toISOString().replace("T", " ").slice(0, 19) + " UTC";

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* ── System Status Bar ─────────────────────────────────────────────── */}
      <SummaryCardGrid>
        <SummaryCard
          label={t("totalDrones")}
          value={drones.length}
        />
        <SummaryCard
          label={t("active")}
          value={activeCount}
          valueColor="text-fleet-green"
        />
        <SummaryCard
          label={t("critical")}
          value={criticalCount}
          valueColor={criticalCount > 0 ? "text-fleet-red" : undefined}
        />
        <SummaryCard
          label={t("offline")}
          value={offlineCount}
          valueColor={offlineCount > 0 ? "text-subtle" : undefined}
        />
        <SummaryCard
          label={t("meshNodes")}
          value={meshNodeCount}
          valueColor="text-fleet-blue"
        />
        <SummaryCard
          label={t("uplink")}
          value={uplinkOnline ? t("uplinkOnline") : t("uplinkOffline")}
          valueColor={uplinkOnline ? "text-fleet-green" : "text-fleet-red"}
        />
        <SummaryCard
          label={t("systemClock")}
          value={clockStr}
          valueColor="text-subtle"
        />
      </SummaryCardGrid>

      {/* ── Main Content ──────────────────────────────────────────────────── */}
      <div className="flex flex-1 min-h-0 overflow-hidden">
        {/* Left column */}
        <div className="flex flex-col flex-1 min-h-0 overflow-hidden border-r border-border">
          {/* Drone telemetry table */}
          <div className="flex-1 overflow-auto">
            <table className="w-full text-left border-collapse">
              <thead className="sticky top-0 z-10 bg-card border-b border-border">
                <tr>
                  {[
                    t("colDroneId"),
                    t("colStatus"),
                    t("colBattery"),
                    t("colLatitude"),
                    t("colLongitude"),
                    t("colHeading"),
                    t("colGridRow"),
                    t("colGridCol"),
                  ].map((col) => (
                    <th
                      key={col}
                      className="px-3 py-2 font-mono text-[10px] tracking-wider text-subtle uppercase whitespace-nowrap"
                    >
                      {col}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {drones.length === 0 && (
                  <tr>
                    <td colSpan={8} className="px-3 py-8 text-center font-mono text-[10px] text-subtle">
                      {t("awaitingTelemetry")}
                    </td>
                  </tr>
                )}
                {drones.map((drone) => (
                  <tr
                    key={drone.id}
                    className={`border-b border-border/50 hover:bg-secondary/20 transition-colors ${statusBgClass[drone.status]}`}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-semibold text-foreground">{drone.id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={cn("inline-block w-1.5 h-1.5 rounded-full", statusDotClass[drone.status], drone.status === "nominal" && "animate-status-pulse")}
                        />
                        <span className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${statusTextClass[drone.status]}`}>
                          {drone.status}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-2">
                      <BatteryBar value={drone.battery} />
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-foreground">
                        {drone.position.lat.toFixed(5)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-foreground">
                        {drone.position.lng.toFixed(5)}
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-foreground">
                        {drone.heading.toFixed(1)}°
                      </span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-muted-foreground">{drone.gridPos.row}</span>
                    </td>
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs text-muted-foreground">{drone.gridPos.col}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Data stream indicator */}
          <div className="shrink-0 flex items-center gap-2 px-4 py-2.5 border-t border-border bg-card">
            <span
              className="inline-block w-2 h-2 rounded-full bg-fleet-green animate-status-pulse-fast"
            />
            <span className="font-mono text-[10px] tracking-widest text-fleet-green uppercase">
              {t("telemetryStreamActive")}
            </span>
            <span className="font-mono text-[10px] text-subtle ml-2">
              {t("streamMeta", { count: drones.length })}
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="w-[300px] shrink-0 flex flex-col gap-px bg-border overflow-auto">
          {/* System Metrics */}
          <div className="bg-background flex-1">
            <SectionCard title={t("systemMetrics")}>
              <MetricRow label={t("cpuUsage")} value={systemMetrics ? `${systemMetrics.cpu}%` : "--"} valueClass={systemMetrics && systemMetrics.cpu > 80 ? "text-fleet-red" : systemMetrics && systemMetrics.cpu > 60 ? "text-fleet-amber" : "text-fleet-green"} />
              <MetricRow label={t("memory")} value={systemMetrics ? `${systemMetrics.memory}%` : "--"} valueClass={systemMetrics && systemMetrics.memory > 80 ? "text-fleet-red" : systemMetrics && systemMetrics.memory > 60 ? "text-fleet-amber" : "text-foreground"} />
              <MetricRow label={t("bandwidth")} value={systemMetrics?.bandwidth ?? "--"} />
              <MetricRow label={t("packetsRx")} value={systemMetrics?.packets ?? "--"} />
              <MetricRow label={t("errors")} value={systemMetrics?.errors ?? "--"} valueClass={(systemMetrics?.errors ?? 0) > 0 ? "text-fleet-red" : "text-fleet-green"} />
            </SectionCard>
          </div>

          {/* Mesh Network Health */}
          <div className="bg-background flex-1">
            <SectionCard title={t("meshNetworkHealth")}>
              <MetricRow label={t("linkCount")} value={meshLinks.length} valueClass="text-fleet-blue" />
              <MetricRow label={t("avgLatency")} value={meshNetworkHealth?.avgLatency ?? "--"} valueClass="text-foreground" />
              <MetricRow label={t("packetLoss")} value={meshNetworkHealth?.packetLoss ?? "--"} valueClass="text-fleet-green" />
              <MetricRow label={t("baseStations")} value={baseStations.length} />
              <MetricRow
                label={t("uplinkStatus")}
                value={uplinkOnline ? t("uplinkOnline") : t("uplinkOffline")}
                valueClass={uplinkOnline ? "text-fleet-green" : "text-fleet-red"}
              />
            </SectionCard>
          </div>

          {/* Environment */}
          <div className="bg-background flex-1">
            <SectionCard title={t("environment")}>
              <MetricRow label={t("temperature")} value={environment?.temp ?? "--"} />
              <MetricRow label={t("humidity")} value={environment?.humidity ?? "--"} />
              <MetricRow label={t("wind")} value={environment?.wind ?? "--"} />
              <MetricRow label={t("visibility")} value={environment?.visibility ?? "--"} />
              <MetricRow label={t("pressure")} value={environment?.pressure ?? "--"} />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
