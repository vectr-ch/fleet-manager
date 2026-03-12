"use client";

import { useState, useMemo } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { SummaryCard, SummaryCardGrid } from "@/components/dashboard/summary-card";
import type { Command, Alert } from "@/lib/types";

type MockEvent = {
  id: string;
  type: "system" | "security";
  title: string;
  actor: string;
  target: string;
  timestamp: Date;
  severity: "info" | "warning" | "critical";
};

type LogEntry =
  | { kind: "command"; data: Command }
  | { kind: "alert"; data: Alert }
  | { kind: "mock"; data: MockEvent };

type FilterCategory = "all" | "commands" | "alerts" | "system" | "security";

// TODO: Replace with tRPC endpoint — mock data for development
const mockEvents: MockEvent[] = [
  { id: "SYS-001", type: "system", title: "Simulation engine started", actor: "system", target: "—", timestamp: new Date(Date.now() - 3600000), severity: "info" },
  { id: "SYS-002", type: "system", title: "Mesh network reconfigured", actor: "auto:scheduler", target: "ALL", timestamp: new Date(Date.now() - 7200000), severity: "info" },
  { id: "SEC-001", type: "security", title: "Operator authenticated", actor: "operator:dk", target: "—", timestamp: new Date(Date.now() - 1800000), severity: "info" },
  { id: "SYS-003", type: "system", title: "Firmware check completed", actor: "system", target: "BASE-01", timestamp: new Date(Date.now() - 5400000), severity: "info" },
  { id: "SEC-002", type: "security", title: "API key rotated", actor: "system", target: "—", timestamp: new Date(Date.now() - 9000000), severity: "info" },
  { id: "SYS-004", type: "system", title: "Telemetry buffer flushed", actor: "auto:scheduler", target: "ALL", timestamp: new Date(Date.now() - 10800000), severity: "info" },
];

function formatTimestamp(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
    hour12: false,
  }).format(date);
}

function formatDateLabel(date: Date): string {
  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function CommandBadge({ state, t }: { state: Command["state"]; t: ReturnType<typeof useTranslations> }) {
  const cfg = {
    pending:   { label: t("cmdStatePending"),   cls: "bg-fleet-blue-dim text-fleet-blue" },
    executing: { label: t("cmdStateExecuting"), cls: "bg-fleet-amber-dim text-fleet-amber" },
    completed: { label: t("cmdStateCompleted"), cls: "bg-fleet-green-dim text-fleet-green" },
    failed:    { label: t("cmdStateFailed"),    cls: "bg-fleet-red-dim text-fleet-red" },
  }[state];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category, t }: { category: "command" | "alert" | "system" | "security"; t: ReturnType<typeof useTranslations> }) {
  const cfg = {
    command:  { label: t("badgeCmd"),      cls: "bg-fleet-green-dim text-fleet-green" },
    alert:    { label: t("badgeAlert"),    cls: "bg-fleet-amber-dim text-fleet-amber" },
    system:   { label: t("badgeSystem"),   cls: "bg-fleet-blue-dim text-fleet-blue" },
    security: { label: t("badgeSecurity"), cls: "bg-fleet-red-dim text-fleet-red" },
  }[category];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function AlertSeverityBadge({ severity, t }: { severity: Alert["severity"]; t: ReturnType<typeof useTranslations> }) {
  const cfg = {
    info:     { label: t("severityInfo"),     cls: "bg-fleet-blue-dim text-fleet-blue" },
    warning:  { label: t("severityWarning"),  cls: "bg-fleet-amber-dim text-fleet-amber" },
    critical: { label: t("severityCritical"), cls: "bg-fleet-red-dim text-fleet-red" },
  }[severity];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function AuditPage() {
  const t = useTranslations("auditPage");
  const [activeFilter, setActiveFilter] = useState<FilterCategory>("all");

  const { data: commands } = trpc.commands.log.useQuery(undefined, { refetchInterval: 3000 });
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });

  const allEntries = useMemo<LogEntry[]>(() => {
    const entries: LogEntry[] = [];

    (commands ?? []).forEach((c) => entries.push({ kind: "command", data: c }));
    (alerts ?? []).forEach((a) => entries.push({ kind: "alert", data: a }));
    mockEvents.forEach((m) => entries.push({ kind: "mock", data: m }));

    return entries.sort(
      (a, b) =>
        new Date(
          b.kind === "command" ? b.data.timestamp :
          b.kind === "alert"   ? b.data.timestamp :
          b.data.timestamp
        ).getTime() -
        new Date(
          a.kind === "command" ? a.data.timestamp :
          a.kind === "alert"   ? a.data.timestamp :
          a.data.timestamp
        ).getTime()
    );
  }, [commands, alerts]);

  const filteredEntries = useMemo<LogEntry[]>(() => {
    if (activeFilter === "all") return allEntries;
    if (activeFilter === "commands") return allEntries.filter((e) => e.kind === "command");
    if (activeFilter === "alerts")   return allEntries.filter((e) => e.kind === "alert");
    if (activeFilter === "system")   return allEntries.filter((e) => e.kind === "mock" && e.data.type === "system");
    if (activeFilter === "security") return allEntries.filter((e) => e.kind === "mock" && e.data.type === "security");
    return allEntries;
  }, [allEntries, activeFilter]);

  const commandCount  = (commands ?? []).length;
  const alertCount    = (alerts ?? []).length;
  const systemCount   = mockEvents.filter((m) => m.type === "system").length;
  const securityCount = mockEvents.filter((m) => m.type === "security").length;
  const totalCount    = commandCount + alertCount + systemCount + securityCount;

  const filters: { key: FilterCategory; label: string }[] = [
    { key: "all",      label: t("filterAll") },
    { key: "commands", label: t("filterCommands") },
    { key: "alerts",   label: t("filterAlerts") },
    { key: "system",   label: t("filterSystem") },
    { key: "security", label: t("filterSecurity") },
  ];

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Summary bar */}
      <SummaryCardGrid columns={4}>
        <SummaryCard
          label={t("totalEvents")}
          value={totalCount}
          meta={<span className="font-mono">{t("last24h")}</span>}
        />
        <SummaryCard
          label={t("commands")}
          value={commandCount}
          valueColor="text-fleet-green"
          meta={<span className="font-mono">{t("last24h")}</span>}
        />
        <SummaryCard
          label={t("alerts")}
          value={alertCount}
          valueColor="text-fleet-amber"
          meta={<span className="font-mono">{t("last24h")}</span>}
        />
        <SummaryCard
          label={t("systemEvents")}
          value={systemCount + securityCount}
          valueColor="text-fleet-blue"
          meta={<span className="font-mono">{t("last24h")}</span>}
        />
      </SummaryCardGrid>

      {/* Filter bar */}
      <div className="flex items-center gap-2 px-5 py-3 border-b border-border shrink-0 bg-card">
        <div className="flex items-center gap-1.5 flex-1">
          {filters.map((f) => (
            <button
              key={f.key}
              onClick={() => setActiveFilter(f.key)}
              className={`font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded transition-colors ${
                activeFilter === f.key
                  ? "bg-secondary text-foreground"
                  : "text-subtle hover:text-muted-foreground hover:bg-accent"
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>
        <div className="font-mono text-[10px] text-subtle tracking-wider uppercase">
          {formatDateLabel(yesterday)} — {formatDateLabel(now)}
        </div>
      </div>

      {/* Log entries */}
      <div className="flex-1 overflow-y-auto min-h-0">
        {filteredEntries.length === 0 ? (
          <div className="flex items-center justify-center h-full text-subtle font-mono text-sm">
            {t("noEventsFound")}
          </div>
        ) : (
          <div className="divide-y divide-border">
            {filteredEntries.map((entry) => {
              if (entry.kind === "command") {
                const cmd = entry.data;
                return (
                  <div key={cmd.id} className="flex items-start gap-4 px-5 py-3 bg-background hover:bg-card transition-colors">
                    <div className="font-mono text-[11px] text-subtle w-20 shrink-0 pt-0.5 tabular-nums">
                      {formatTimestamp(new Date(cmd.timestamp))}
                    </div>
                    <div className="w-16 shrink-0 pt-0.5">
                      <CategoryBadge category="command" t={t} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-foreground capitalize">
                        {cmd.type.replace(/_/g, " ")}
                      </div>
                      <div className="font-mono text-[11px] text-subtle mt-0.5">
                        {t("idLabel")} {cmd.id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("actor")}</span> system
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("target")}</span> {cmd.target}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <CommandBadge state={cmd.state} t={t} />
                    </div>
                  </div>
                );
              }

              if (entry.kind === "alert") {
                const alert = entry.data;
                return (
                  <div key={alert.id} className="flex items-start gap-4 px-5 py-3 bg-background hover:bg-card transition-colors">
                    <div className="font-mono text-[11px] text-subtle w-20 shrink-0 pt-0.5 tabular-nums">
                      {formatTimestamp(new Date(alert.timestamp))}
                    </div>
                    <div className="w-16 shrink-0 pt-0.5">
                      <CategoryBadge category="alert" t={t} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {alert.title}
                      </div>
                      <div className="font-mono text-[11px] text-subtle mt-0.5 truncate">
                        {alert.detail}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("actor")}</span> system
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("target")}</span> {alert.droneId ?? "ALL"}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <AlertSeverityBadge severity={alert.severity} t={t} />
                    </div>
                  </div>
                );
              }

              if (entry.kind === "mock") {
                const evt = entry.data;
                return (
                  <div key={evt.id} className="flex items-start gap-4 px-5 py-3 bg-background hover:bg-card transition-colors">
                    <div className="font-mono text-[11px] text-subtle w-20 shrink-0 pt-0.5 tabular-nums">
                      {formatTimestamp(evt.timestamp)}
                    </div>
                    <div className="w-16 shrink-0 pt-0.5">
                      <CategoryBadge category={evt.type} t={t} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {evt.title}
                      </div>
                      <div className="font-mono text-[11px] text-subtle mt-0.5">
                        {t("idLabel")} {evt.id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("actor")}</span> {evt.actor}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">{t("target")}</span> {evt.target}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <AlertSeverityBadge severity={evt.severity} t={t} />
                    </div>
                  </div>
                );
              }

              return null;
            })}
          </div>
        )}
      </div>
    </div>
  );
}
