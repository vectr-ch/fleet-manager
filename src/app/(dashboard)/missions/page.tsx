"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";

const pastMissions = [
  { id: "MISSION-240", name: "Perimeter Scan", status: "complete", coverage: 100, duration: "42m", date: "2026-03-10" },
  { id: "MISSION-239", name: "Grid Survey North", status: "complete", coverage: 98, duration: "1h 12m", date: "2026-03-09" },
  { id: "MISSION-238", name: "Emergency Search", status: "aborted", coverage: 34, duration: "18m", date: "2026-03-08" },
  { id: "MISSION-237", name: "Boundary Mapping", status: "complete", coverage: 100, duration: "55m", date: "2026-03-07" },
  { id: "MISSION-236", name: "Thermal Survey", status: "complete", coverage: 95, duration: "1h 03m", date: "2026-03-06" },
];

const missionParams = {
  formation: "Grid",
  spacing: "12m",
  scanPattern: "Boustrophedon",
  altitude: "45m AGL",
  overlapH: "80%",
  overlapV: "60%",
  gimbalAngle: "-90°",
  speed: "8 m/s",
};

const missionStatusStyles: Record<string, string> = {
  active:    "bg-fleet-green-dim text-fleet-green",
  paused:    "bg-fleet-amber-dim text-fleet-amber",
  aborted:   "bg-fleet-red-dim text-fleet-red",
  complete:  "bg-fleet-blue-dim text-fleet-blue",
};

const commandStateStyles: Record<string, string> = {
  completed: "bg-fleet-green-dim text-fleet-green",
  executing: "bg-fleet-blue-dim text-fleet-blue",
  pending:   "bg-fleet-amber-dim text-fleet-amber",
  failed:    "bg-fleet-red-dim text-fleet-red",
};

const commandStateLabels: Record<string, string> = {
  completed: "DONE",
  executing: "EXEC",
  pending:   "PEND",
  failed:    "FAIL",
};

const missionCommandTypes = new Set([
  "pause", "resume", "rtb", "abort", "activate_mission", "set_formation", "adjust_spacing",
]);

export default function MissionsPage() {
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: commands } = trpc.commands.log.useQuery(undefined, { refetchInterval: 3000 });

  const missionCommands = commands?.filter((c) => missionCommandTypes.has(c.type)) ?? [];

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-4 gap-4">

      {/* Active Mission Card */}
      <div className="bg-card border border-border rounded-[5px] p-5 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-1">
              Active Mission
            </div>
            {mission ? (
              <div className="flex items-center gap-3">
                <span className="font-mono text-lg font-semibold text-foreground tracking-tight">
                  {mission.name}
                </span>
                <span className={cn(
                  "font-mono text-[10px] font-semibold px-2 py-0.5 rounded-[5px] uppercase tracking-wider",
                  missionStatusStyles[mission.status] ?? "bg-secondary text-muted-foreground"
                )}>
                  {mission.status}
                </span>
              </div>
            ) : (
              <div className="font-mono text-sm text-muted-foreground">No active mission</div>
            )}
            {mission && (
              <div className="font-mono text-[11px] text-muted-foreground mt-1">
                {mission.id} · Base {mission.baseId}
              </div>
            )}
          </div>

          {mission && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-fleet-green" style={{ animation: "pulse 2s infinite" }} />
              <span className="font-mono text-[10px] text-fleet-green uppercase tracking-wider">Live</span>
            </div>
          )}
        </div>

        {mission ? (
          <>
            {/* Coverage progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">Coverage</span>
                <span className="font-mono text-sm font-semibold text-foreground">{Math.round(mission.coverage)}%</span>
              </div>
              <div className="h-1.5 bg-secondary rounded-full overflow-hidden">
                <div
                  className="h-full bg-fleet-green rounded-full transition-all duration-500"
                  style={{ width: `${mission.coverage}%` }}
                />
              </div>
            </div>

            {/* Mission stats grid */}
            <div className="grid grid-cols-4 gap-px bg-border rounded-[5px] overflow-hidden border border-border">
              {[
                { label: "Formation", value: mission.formation.charAt(0).toUpperCase() + mission.formation.slice(1) },
                { label: "Integrity", value: `${mission.formationIntegrity}%`, color: mission.formationIntegrity >= 90 ? "text-fleet-green" : mission.formationIntegrity >= 70 ? "text-fleet-amber" : "text-fleet-red" },
                { label: "ETA", value: `${mission.eta}m` },
                { label: "Waypoints", value: `${mission.bounds?.length ?? 0}` },
              ].map((item) => (
                <div key={item.label} className="bg-card px-3.5 py-2.5 flex flex-col gap-1">
                  <div className="font-mono text-[9px] text-subtle uppercase tracking-wider">{item.label}</div>
                  <div className={cn("font-mono text-sm font-semibold tracking-tight", item.color ?? "text-foreground")}>
                    {item.value}
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <div className="h-16 flex items-center justify-center border border-border rounded-[5px] bg-secondary">
            <span className="font-mono text-[11px] text-muted-foreground">Awaiting mission activation</span>
          </div>
        )}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-[1fr_280px] gap-4 flex-1 min-h-0 overflow-hidden">

        {/* Mission History Table */}
        <div className="bg-card border border-border rounded-[5px] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">Mission History</span>
            <span className="font-mono text-[10px] text-muted-foreground">{pastMissions.length} records</span>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Table header */}
            <div className="grid grid-cols-[160px_1fr_90px_80px_70px_90px] gap-0 px-4 py-2 border-b border-border bg-secondary">
              {["Mission ID", "Name", "Status", "Duration", "Coverage", "Date"].map((h) => (
                <div key={h} className="font-mono text-[9px] tracking-wider text-subtle uppercase">{h}</div>
              ))}
            </div>

            {/* Table rows */}
            {pastMissions.map((m, i) => (
              <div
                key={m.id}
                className={cn(
                  "grid grid-cols-[160px_1fr_90px_80px_70px_90px] gap-0 px-4 py-2.5 border-b border-border items-center hover:bg-secondary/50 transition-colors",
                  i === pastMissions.length - 1 && "border-b-0"
                )}
              >
                <div className="font-mono text-[11px] text-muted-foreground">{m.id}</div>
                <div className="font-mono text-[12px] font-semibold text-foreground pr-2">{m.name}</div>
                <div>
                  <span className={cn(
                    "font-mono text-[9px] font-semibold px-1.5 py-0.5 rounded-[5px] uppercase tracking-wider",
                    missionStatusStyles[m.status] ?? "bg-secondary text-muted-foreground"
                  )}>
                    {m.status}
                  </span>
                </div>
                <div className="font-mono text-[11px] text-muted-foreground">{m.duration}</div>
                <div className={cn(
                  "font-mono text-[12px] font-semibold",
                  m.coverage === 100 ? "text-fleet-green" : m.coverage >= 80 ? "text-fleet-amber" : "text-fleet-red"
                )}>
                  {m.coverage}%
                </div>
                <div className="font-mono text-[11px] text-subtle">{m.date}</div>
              </div>
            ))}
          </div>
        </div>

        {/* Mission Parameters Card */}
        <div className="bg-card border border-border rounded-[5px] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0">
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">Mission Parameters</span>
          </div>

          <div className="flex flex-col gap-0 overflow-y-auto flex-1">
            {Object.entries(missionParams).map(([key, value], i, arr) => (
              <div
                key={key}
                className={cn(
                  "flex items-center justify-between px-4 py-2.5 border-b border-border",
                  i === arr.length - 1 && "border-b-0"
                )}
              >
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">
                  {key.replace(/([A-Z])/g, " $1").trim()}
                </span>
                <span className="font-mono text-sm font-semibold text-foreground">{value}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Command Log */}
      <div className="bg-card border border-border rounded-[5px] shrink-0">
        <div className="px-4 py-3 border-b border-border flex items-center justify-between">
          <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">Mission Command Log</span>
          <span className="font-mono text-[10px] text-muted-foreground">{missionCommands.length} commands</span>
        </div>

        {missionCommands.length === 0 ? (
          <div className="px-4 py-4 font-mono text-[11px] text-muted-foreground">No mission commands logged</div>
        ) : (
          <div className="flex flex-col gap-0 px-3.5 py-2.5">
            <div className="flex flex-col gap-1">
              {missionCommands.slice(0, 8).map((cmd) => (
                <div
                  key={cmd.id}
                  className="flex items-center gap-2 font-mono text-[10px] px-1.5 py-1 rounded-[5px] bg-background border border-border"
                >
                  <span className={cn(
                    "px-1.5 py-px rounded-[5px] text-[9px] font-semibold shrink-0",
                    commandStateStyles[cmd.state] ?? "bg-secondary text-muted-foreground"
                  )}>
                    {commandStateLabels[cmd.state] ?? cmd.state.toUpperCase()}
                  </span>
                  <span className="text-muted-foreground flex-1">
                    {cmd.type.toUpperCase().replace(/_/g, " ")}
                  </span>
                  <span className="text-subtle">{cmd.target}</span>
                  <span className="text-subtle text-[9px]">
                    {new Date(cmd.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

    </div>
  );
}
