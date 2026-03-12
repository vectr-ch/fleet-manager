"use client";

import { trpc } from "@/lib/trpc/client";
import type { Drone } from "@/lib/types";

// ── Mock static data ──────────────────────────────────────────────────────────
const systemMetrics = {
  cpu: 23,
  memory: 41,
  bandwidth: "2.4 Mbps",
  packets: "1.2M",
  errors: 0,
};

const environment = {
  temp: "18°C",
  humidity: "45%",
  wind: "12 km/h NW",
  visibility: "8.2 km",
  pressure: "1013 hPa",
};

// ── Helpers ───────────────────────────────────────────────────────────────────
function statusColor(status: Drone["status"]) {
  switch (status) {
    case "nominal":
      return "text-fleet-green";
    case "warning":
      return "text-fleet-amber";
    case "critical":
      return "text-fleet-red";
    case "rtb":
      return "text-fleet-blue";
    case "offline":
      return "text-subtle";
    default:
      return "text-muted-foreground";
  }
}

function statusBg(status: Drone["status"]) {
  switch (status) {
    case "nominal":
      return "bg-fleet-green-dim border-fleet-green/10";
    case "warning":
      return "bg-fleet-amber-dim border-fleet-amber/10";
    case "critical":
      return "bg-fleet-red-dim border-fleet-red/10";
    case "rtb":
      return "bg-fleet-blue-dim border-fleet-blue/10";
    default:
      return "bg-transparent border-transparent";
  }
}

function batteryBarColor(pct: number) {
  if (pct > 50) return "bg-fleet-green";
  if (pct > 20) return "bg-fleet-amber";
  return "bg-fleet-red";
}

function BatteryBar({ value }: { value: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="relative h-1.5 w-16 rounded-full bg-secondary overflow-hidden">
        <div
          className={`absolute left-0 top-0 h-full rounded-full transition-all duration-300 ${batteryBarColor(value)}`}
          style={{ width: `${value}%` }}
        />
      </div>
      <span className={`font-mono text-[10px] font-semibold ${batteryBarColor(value).replace("bg-", "text-")}`}>
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
  const { data: drones = [] } = trpc.drones.list.useQuery(undefined, { refetchInterval: 1000 });
  const { data: meshLinks = [] } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 5000 });
  const { data: baseStations = [] } = trpc.baseStations.useQuery(undefined, { refetchInterval: 5000 });

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
      <div className="flex items-stretch border-b border-border bg-card shrink-0">
        {[
          { label: "Total Drones", value: drones.length, valueClass: "text-foreground" },
          { label: "Active", value: activeCount, valueClass: "text-fleet-green" },
          { label: "Critical", value: criticalCount, valueClass: criticalCount > 0 ? "text-fleet-red" : "text-foreground" },
          { label: "Offline", value: offlineCount, valueClass: offlineCount > 0 ? "text-subtle" : "text-foreground" },
          { label: "Mesh Nodes", value: meshNodeCount, valueClass: "text-fleet-blue" },
          {
            label: "Uplink",
            value: uplinkOnline ? "ONLINE" : "OFFLINE",
            valueClass: uplinkOnline ? "text-fleet-green" : "text-fleet-red",
          },
          { label: "System Clock", value: clockStr, valueClass: "text-subtle" },
        ].map((item, i) => (
          <div
            key={i}
            className="flex flex-col items-center justify-center px-4 py-2.5 border-r border-border last:border-r-0 flex-1"
          >
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-0.5">
              {item.label}
            </span>
            <span className={`font-mono text-sm font-semibold ${item.valueClass}`}>{item.value}</span>
          </div>
        ))}
      </div>

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
                    "Drone ID",
                    "Status",
                    "Battery",
                    "Latitude",
                    "Longitude",
                    "Heading",
                    "Grid Row",
                    "Grid Col",
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
                      AWAITING TELEMETRY FEED...
                    </td>
                  </tr>
                )}
                {drones.map((drone) => (
                  <tr
                    key={drone.id}
                    className={`border-b border-border/50 hover:bg-secondary/20 transition-colors ${statusBg(drone.status)}`}
                  >
                    <td className="px-3 py-2">
                      <span className="font-mono text-xs font-semibold text-foreground">{drone.id}</span>
                    </td>
                    <td className="px-3 py-2">
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`inline-block w-1.5 h-1.5 rounded-full ${statusColor(drone.status).replace("text-", "bg-")}`}
                          style={{ animation: drone.status === "nominal" ? "pulse 2s infinite" : undefined }}
                        />
                        <span className={`font-mono text-[10px] tracking-wider uppercase font-semibold ${statusColor(drone.status)}`}>
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
              className="inline-block w-2 h-2 rounded-full bg-fleet-green"
              style={{ animation: "pulse 1s infinite" }}
            />
            <span className="font-mono text-[10px] tracking-widest text-fleet-green uppercase">
              Telemetry Stream Active
            </span>
            <span className="font-mono text-[10px] text-subtle ml-2">
              — {drones.length} nodes · 1s refresh
            </span>
          </div>
        </div>

        {/* Right column */}
        <div className="w-[300px] shrink-0 flex flex-col gap-px bg-border overflow-auto">
          {/* System Metrics */}
          <div className="bg-background flex-1">
            <SectionCard title="System Metrics">
              <MetricRow label="CPU Usage" value={`${systemMetrics.cpu}%`} valueClass={systemMetrics.cpu > 80 ? "text-fleet-red" : systemMetrics.cpu > 60 ? "text-fleet-amber" : "text-fleet-green"} />
              <MetricRow label="Memory" value={`${systemMetrics.memory}%`} valueClass={systemMetrics.memory > 80 ? "text-fleet-red" : systemMetrics.memory > 60 ? "text-fleet-amber" : "text-foreground"} />
              <MetricRow label="Bandwidth" value={systemMetrics.bandwidth} />
              <MetricRow label="Packets Rx" value={systemMetrics.packets} />
              <MetricRow label="Errors" value={systemMetrics.errors} valueClass={systemMetrics.errors > 0 ? "text-fleet-red" : "text-fleet-green"} />
            </SectionCard>
          </div>

          {/* Mesh Network Health */}
          <div className="bg-background flex-1">
            <SectionCard title="Mesh Network Health">
              <MetricRow label="Link Count" value={meshLinks.length} valueClass="text-fleet-blue" />
              <MetricRow label="Avg Latency" value="12 ms" valueClass="text-foreground" />
              <MetricRow label="Packet Loss" value="0.02%" valueClass="text-fleet-green" />
              <MetricRow label="Base Stations" value={baseStations.length} />
              <MetricRow
                label="Uplink Status"
                value={uplinkOnline ? "ONLINE" : "OFFLINE"}
                valueClass={uplinkOnline ? "text-fleet-green" : "text-fleet-red"}
              />
            </SectionCard>
          </div>

          {/* Environment */}
          <div className="bg-background flex-1">
            <SectionCard title="Environment">
              <MetricRow label="Temperature" value={environment.temp} />
              <MetricRow label="Humidity" value={environment.humidity} />
              <MetricRow label="Wind" value={environment.wind} />
              <MetricRow label="Visibility" value={environment.visibility} />
              <MetricRow label="Pressure" value={environment.pressure} />
            </SectionCard>
          </div>
        </div>
      </div>
    </div>
  );
}
