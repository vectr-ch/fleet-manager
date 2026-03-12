"use client";

import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { SummaryCard, SummaryCardGrid } from "@/components/dashboard/summary-card";
import { REFETCH_INTERVAL } from "@/lib/constants";

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

const missionCommandTypes = new Set([
  "pause", "resume", "rtb", "abort", "activate_mission", "set_formation", "adjust_spacing",
]);

export default function MissionsPage() {
  const t = useTranslations("missionsPage");
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.FAST });
  const { data: commands } = trpc.commands.log.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.MEDIUM });
  const { data: pastMissions = [] } = trpc.missions.history.useQuery(undefined, { refetchInterval: REFETCH_INTERVAL.SLOW });
  const { data: missionParams } = trpc.missions.parameters.useQuery();

  const missionCommands = commands?.filter((c) => missionCommandTypes.has(c.type)) ?? [];

  const commandStateLabels: Record<string, string> = {
    completed: t("cmdStateDone"),
    executing: t("cmdStateExec"),
    pending:   t("cmdStatePend"),
    failed:    t("cmdStateFail"),
  };

  return (
    <div className="flex-1 flex flex-col overflow-hidden min-h-0 p-4 gap-4">

      {/* Active Mission Card */}
      <div className="bg-card border border-border rounded-[5px] p-5 shrink-0">
        <div className="flex items-start justify-between mb-4">
          <div>
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase mb-1">
              {t("activeMission")}
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
              <div className="font-mono text-sm text-muted-foreground">{t("noActiveMission")}</div>
            )}
            {mission && (
              <div className="font-mono text-[11px] text-muted-foreground mt-1">
                {mission.id} · Base {mission.baseId}
              </div>
            )}
          </div>

          {mission && (
            <div className="flex items-center gap-2">
              <div className="w-1.5 h-1.5 rounded-full bg-fleet-green animate-status-pulse" />
              <span className="font-mono text-[10px] text-fleet-green uppercase tracking-wider">{t("live")}</span>
            </div>
          )}
        </div>

        {mission ? (
          <>
            {/* Coverage progress bar */}
            <div className="mb-4">
              <div className="flex items-center justify-between mb-1.5">
                <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("coverage")}</span>
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
            <SummaryCardGrid columns={4}>
              <SummaryCard
                label={t("formation")}
                value={mission.formation.charAt(0).toUpperCase() + mission.formation.slice(1)}
              />
              <SummaryCard
                label={t("integrity")}
                value={`${mission.formationIntegrity}%`}
                valueColor={
                  mission.formationIntegrity >= 90
                    ? "text-fleet-green"
                    : mission.formationIntegrity >= 70
                    ? "text-fleet-amber"
                    : "text-fleet-red"
                }
              />
              <SummaryCard
                label={t("eta")}
                value={`${mission.eta}m`}
              />
              <SummaryCard
                label={t("waypoints")}
                value={`${mission.bounds?.length ?? 0}`}
              />
            </SummaryCardGrid>
          </>
        ) : (
          <div className="h-16 flex items-center justify-center border border-border rounded-[5px] bg-secondary">
            <span className="font-mono text-[11px] text-muted-foreground">{t("awaitingActivation")}</span>
          </div>
        )}
      </div>

      {/* Two-column section */}
      <div className="grid grid-cols-[1fr_280px] gap-4 flex-1 min-h-0 overflow-hidden">

        {/* Mission History Table */}
        <div className="bg-card border border-border rounded-[5px] flex flex-col overflow-hidden">
          <div className="px-4 py-3 border-b border-border shrink-0 flex items-center justify-between">
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("missionHistory")}</span>
            <span className="font-mono text-[10px] text-muted-foreground">{t("historyRecords", { count: pastMissions.length })}</span>
          </div>

          <div className="overflow-y-auto flex-1">
            {/* Table header */}
            <div className="grid grid-cols-[160px_1fr_90px_80px_70px_90px] gap-0 px-4 py-2 border-b border-border bg-secondary">
              {[
                t("colMissionId"),
                t("colName"),
                t("colStatus"),
                t("colDuration"),
                t("colCoverage"),
                t("colDate"),
              ].map((h) => (
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
            <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("missionParameters")}</span>
          </div>

          <div className="flex flex-col gap-0 overflow-y-auto flex-1">
            {Object.entries(missionParams ?? {}).map(([key, value], i, arr) => (
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
          <span className="font-mono text-[10px] tracking-wider text-subtle uppercase">{t("missionCommandLog")}</span>
          <span className="font-mono text-[10px] text-muted-foreground">{t("commandCount", { count: missionCommands.length })}</span>
        </div>

        {missionCommands.length === 0 ? (
          <div className="px-4 py-4 font-mono text-[11px] text-muted-foreground">{t("noCommandsLogged")}</div>
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
