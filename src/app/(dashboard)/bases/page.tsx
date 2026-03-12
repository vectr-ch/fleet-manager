"use client";

import { trpc } from "@/lib/trpc/client";

const mockBases = [
  {
    id: "BASE-02",
    position: { lat: 32.255, lng: -110.910 },
    status: "online" as const,
    uplinkLatency: 8,
    firmware: "v2.4.1",
    antenna: "Omni-directional",
    signal: 94,
    lastMaintenance: "2026-03-01",
    connectedDrones: 3,
  },
  {
    id: "BASE-03",
    position: { lat: 32.270, lng: -110.945 },
    status: "offline" as const,
    uplinkLatency: 0,
    firmware: "v2.3.8",
    antenna: "Directional",
    signal: 0,
    lastMaintenance: "2026-02-15",
    connectedDrones: 0,
  },
];

function latencyQuality(ms: number): { label: string; color: string } {
  if (ms === 0) return { label: "N/A", color: "text-subtle" };
  if (ms <= 10) return { label: "Excellent", color: "text-fleet-green" };
  if (ms <= 25) return { label: "Good", color: "text-fleet-green" };
  if (ms <= 50) return { label: "Fair", color: "text-fleet-amber" };
  return { label: "Poor", color: "text-fleet-red" };
}

function signalBar(pct: number) {
  const bars = 5;
  const filled = Math.round((pct / 100) * bars);
  return (
    <div className="flex items-end gap-[2px]">
      {Array.from({ length: bars }).map((_, i) => (
        <div
          key={i}
          style={{ height: `${(i + 1) * 3 + 4}px`, width: "4px", borderRadius: "1px" }}
          className={i < filled ? "bg-fleet-green" : "bg-border"}
        />
      ))}
    </div>
  );
}

export default function BasesPage() {
  const { data: baseStationsRaw } = trpc.baseStations.useQuery(undefined, { refetchInterval: 5000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 5000 });
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });

  // Merge API base(s) with mock extras
  const apiBases = (baseStationsRaw ?? []).map((b) => ({
    id: b.id,
    position: b.position,
    status: b.status,
    uplinkLatency: b.uplinkLatency,
    firmware: "v2.4.2",
    antenna: "Omni-directional",
    signal: b.status === "online" ? 88 : 0,
    lastMaintenance: "2026-03-08",
    connectedDrones: drones?.filter((d) => d.status !== "offline").length ?? 0,
  }));

  const allBases = [...apiBases, ...mockBases];

  const totalBases = allBases.length;
  const onlineBases = allBases.filter((b) => b.status === "online").length;
  const avgLatency =
    onlineBases > 0
      ? Math.round(
          allBases
            .filter((b) => b.status === "online")
            .reduce((sum, b) => sum + b.uplinkLatency, 0) / onlineBases
        )
      : 0;
  const connectedDronesTotal = allBases.reduce((sum, b) => sum + b.connectedDrones, 0);

  const summaryCards = [
    {
      label: "Total Bases",
      value: String(totalBases),
      meta: <><span className="text-fleet-blue">●</span> Registered</>,
    },
    {
      label: "Online",
      value: String(onlineBases),
      valueColor: onlineBases === totalBases ? "text-fleet-green" : "text-fleet-amber",
      meta: (
        <>
          <span className={onlineBases === totalBases ? "text-fleet-green" : "text-fleet-amber"}>●</span>{" "}
          {totalBases - onlineBases} offline
        </>
      ),
    },
    {
      label: "Avg Latency",
      value: avgLatency > 0 ? String(avgLatency) : "--",
      unit: avgLatency > 0 ? "ms" : undefined,
      meta: (
        <>
          <span className="text-fleet-green">●</span> Uplink quality nominal
        </>
      ),
    },
    {
      label: "Connected Drones",
      value: String(connectedDronesTotal),
      meta: (
        <>
          <span className="text-fleet-blue">●</span> Active assignments
        </>
      ),
    },
  ];

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-y-auto">
      {/* Page header */}
      <div className="px-5 pt-4 pb-3 shrink-0 flex items-center justify-between border-b border-border">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">Base Stations</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {totalBases} registered · {onlineBases} online · mesh network active
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-[5px] bg-fleet-green-dim border border-fleet-green/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fleet-green animate-pulse inline-block" />
            <span className="font-mono text-[10px] tracking-wider text-fleet-green uppercase">Network Active</span>
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-4 gap-px bg-border border-b border-border shrink-0">
        {summaryCards.map((card) => (
          <div key={card.label} className="bg-card px-4 py-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">{card.label}</div>
            <div className={`font-mono text-[22px] font-semibold leading-none tracking-tight ${card.valueColor ?? "text-foreground"}`}>
              {card.value}
              {card.unit && <span className="text-sm text-subtle ml-0.5">{card.unit}</span>}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">{card.meta}</div>
          </div>
        ))}
      </div>

      {/* Base station cards grid */}
      <div className="flex-1 p-5 grid grid-cols-3 gap-3 content-start">
        {allBases.map((base) => {
          const latency = latencyQuality(base.uplinkLatency);
          const isOnline = base.status === "online";

          return (
            <div
              key={base.id}
              className="bg-card border border-border rounded-[5px] p-4 flex flex-col gap-4"
            >
              {/* Card header */}
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <div
                    className={`w-2 h-2 rounded-full shrink-0 ${
                      isOnline ? "bg-fleet-green animate-pulse" : "bg-border"
                    }`}
                  />
                  <div className="font-mono text-sm font-semibold text-foreground">{base.id}</div>
                </div>
                <div
                  className={`px-2 py-0.5 rounded-[5px] font-mono text-[10px] tracking-wider uppercase ${
                    isOnline
                      ? "bg-fleet-green-dim text-fleet-green border border-fleet-green/20"
                      : "bg-secondary text-subtle border border-border"
                  }`}
                >
                  {base.status}
                </div>
              </div>

              {/* Position */}
              <div className="flex flex-col gap-1">
                <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Position</div>
                <div className="font-mono text-xs text-foreground">
                  {base.position.lat.toFixed(4)}°N · {Math.abs(base.position.lng).toFixed(4)}°W
                </div>
              </div>

              {/* Metrics row */}
              <div className="grid grid-cols-2 gap-3">
                {/* Uplink latency */}
                <div className="bg-background rounded-[5px] p-2.5 flex flex-col gap-1.5">
                  <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Uplink Latency</div>
                  <div className="font-mono text-sm font-semibold text-foreground">
                    {isOnline ? `${base.uplinkLatency}ms` : "--"}
                  </div>
                  <div className={`font-mono text-[10px] ${latency.color}`}>{latency.label}</div>
                </div>

                {/* Connected drones */}
                <div className="bg-background rounded-[5px] p-2.5 flex flex-col gap-1.5">
                  <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Drones</div>
                  <div className="font-mono text-sm font-semibold text-foreground">{base.connectedDrones}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {base.connectedDrones === 1 ? "assigned" : "assigned"}
                  </div>
                </div>
              </div>

              {/* Hardware info */}
              <div className="border-t border-border pt-3 flex flex-col gap-2">
                <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-1">Hardware</div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-subtle">Firmware</span>
                  <span className="font-mono text-[10px] text-foreground">{base.firmware}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-subtle">Antenna</span>
                  <span className="font-mono text-[10px] text-foreground">{base.antenna}</span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-subtle">Signal</span>
                  <div className="flex items-center gap-2">
                    {signalBar(base.signal)}
                    <span className={`font-mono text-[10px] ${isOnline ? "text-foreground" : "text-subtle"}`}>
                      {base.signal}%
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-mono text-[10px] text-subtle">Last Maintenance</span>
                  <span className="font-mono text-[10px] text-foreground">{base.lastMaintenance}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Network connectivity panel */}
      <div className="mx-5 mb-5 bg-card border border-border rounded-[5px] p-4 shrink-0">
        <div className="flex items-center justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-1">Network Topology</div>
            <div className="text-[13px] font-semibold text-foreground">Mesh Connectivity</div>
          </div>
          <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-[5px] bg-fleet-blue-dim border border-fleet-blue/20">
            <span className="w-1.5 h-1.5 rounded-full bg-fleet-blue inline-block" />
            <span className="font-mono text-[10px] tracking-wider text-fleet-blue uppercase">
              {(meshLinks?.length ?? 0) > 0 ? "Mesh Active" : "No Links"}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-4 gap-3">
          <div className="bg-background rounded-[5px] p-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Mesh Links</div>
            <div className="font-mono text-lg font-semibold text-foreground">{meshLinks?.length ?? 0}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="text-fleet-green">●</span> Active connections
            </div>
          </div>

          <div className="bg-background rounded-[5px] p-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Nodes Online</div>
            <div className="font-mono text-lg font-semibold text-fleet-green">{onlineBases}</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="text-fleet-green">●</span> of {totalBases} total
            </div>
          </div>

          <div className="bg-background rounded-[5px] p-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Topology</div>
            <div className="font-mono text-lg font-semibold text-foreground">Star</div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className="text-fleet-blue">●</span> Hub-spoke config
            </div>
          </div>

          <div className="bg-background rounded-[5px] p-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">Redundancy</div>
            <div className={`font-mono text-lg font-semibold ${onlineBases >= 2 ? "text-fleet-green" : "text-fleet-red"}`}>
              {onlineBases >= 2 ? "Active" : "None"}
            </div>
            <div className="text-[11px] text-muted-foreground flex items-center gap-1">
              <span className={onlineBases >= 2 ? "text-fleet-green" : "text-fleet-red"}>●</span>
              {onlineBases >= 2 ? "Failover ready" : "Single point"}
            </div>
          </div>
        </div>

        {/* Link list */}
        {(meshLinks?.length ?? 0) > 0 && (
          <div className="mt-3 border-t border-border pt-3">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-2">Active Links</div>
            <div className="flex flex-wrap gap-2">
              {meshLinks?.map((link, i) => (
                <div
                  key={i}
                  className="flex items-center gap-1.5 px-2 py-1 bg-secondary rounded-[5px] border border-border"
                >
                  <span className="w-1.5 h-1.5 rounded-full bg-fleet-green inline-block" />
                  <span className="font-mono text-[10px] text-foreground">{link.from}</span>
                  <span className="font-mono text-[10px] text-subtle">→</span>
                  <span className="font-mono text-[10px] text-foreground">{link.to}</span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
