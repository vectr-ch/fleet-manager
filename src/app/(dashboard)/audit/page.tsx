"use client";

import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc/client";

type Command = {
  id: string;
  type: "pause" | "resume" | "rtb" | "goto" | "orbit" | "abort" | "activate_mission" | "set_formation" | "adjust_spacing";
  target: string;
  state: "pending" | "executing" | "completed" | "failed";
  timestamp: Date;
};

type Alert = {
  id: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  droneId?: string;
  timestamp: Date;
};

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

function CommandBadge({ state }: { state: Command["state"] }) {
  const cfg = {
    pending:   { label: "PENDING",   cls: "bg-fleet-blue-dim text-fleet-blue" },
    executing: { label: "EXECUTING", cls: "bg-fleet-amber-dim text-fleet-amber" },
    completed: { label: "COMPLETED", cls: "bg-fleet-green-dim text-fleet-green" },
    failed:    { label: "FAILED",    cls: "bg-fleet-red-dim text-fleet-red" },
  }[state];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function CategoryBadge({ category }: { category: "command" | "alert" | "system" | "security" }) {
  const cfg = {
    command:  { label: "CMD",      cls: "bg-fleet-green-dim text-fleet-green" },
    alert:    { label: "ALERT",    cls: "bg-fleet-amber-dim text-fleet-amber" },
    system:   { label: "SYSTEM",   cls: "bg-fleet-blue-dim text-fleet-blue" },
    security: { label: "SECURITY", cls: "bg-fleet-red-dim text-fleet-red" },
  }[category];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

function AlertSeverityBadge({ severity }: { severity: Alert["severity"] }) {
  const cfg = {
    info:     { label: "INFO",     cls: "bg-fleet-blue-dim text-fleet-blue" },
    warning:  { label: "WARNING",  cls: "bg-fleet-amber-dim text-fleet-amber" },
    critical: { label: "CRITICAL", cls: "bg-fleet-red-dim text-fleet-red" },
  }[severity];
  return (
    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded ${cfg.cls}`}>
      {cfg.label}
    </span>
  );
}

export default function AuditPage() {
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
    { key: "all",      label: "All" },
    { key: "commands", label: "Commands" },
    { key: "alerts",   label: "Alerts" },
    { key: "system",   label: "System" },
    { key: "security", label: "Security" },
  ];

  const now = new Date();
  const yesterday = new Date(now.getTime() - 86400000);

  return (
    <div className="flex flex-col flex-1 min-h-0 overflow-hidden">
      {/* Summary bar */}
      <div className="grid grid-cols-4 gap-px bg-border border-b border-border shrink-0">
        {[
          { label: "Total Events",   value: totalCount,    color: "text-foreground" },
          { label: "Commands",       value: commandCount,  color: "text-fleet-green" },
          { label: "Alerts",         value: alertCount,    color: "text-fleet-amber" },
          { label: "System Events",  value: systemCount + securityCount, color: "text-fleet-blue" },
        ].map((stat) => (
          <div key={stat.label} className="bg-card px-4 py-3 flex flex-col gap-1">
            <div className="font-mono text-[10px] tracking-wider text-subtle uppercase">
              {stat.label}
            </div>
            <div className={`font-mono text-[22px] font-semibold leading-none tracking-tight ${stat.color}`}>
              {stat.value}
            </div>
            <div className="text-[11px] text-muted-foreground font-mono">last 24h</div>
          </div>
        ))}
      </div>

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
            No events found
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
                      <CategoryBadge category="command" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-foreground capitalize">
                        {cmd.type.replace(/_/g, " ")}
                      </div>
                      <div className="font-mono text-[11px] text-subtle mt-0.5">
                        ID: {cmd.id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">actor</span> system
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">target</span> {cmd.target}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <CommandBadge state={cmd.state} />
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
                      <CategoryBadge category="alert" />
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
                        <span className="text-subtle">actor</span> system
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">target</span> {alert.droneId ?? "ALL"}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <AlertSeverityBadge severity={alert.severity} />
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
                      <CategoryBadge category={evt.type} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="font-mono text-sm font-semibold text-foreground">
                        {evt.title}
                      </div>
                      <div className="font-mono text-[11px] text-subtle mt-0.5">
                        ID: {evt.id}
                      </div>
                    </div>
                    <div className="flex flex-col items-end gap-1 shrink-0">
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">actor</span> {evt.actor}
                      </div>
                      <div className="font-mono text-[11px] text-muted-foreground">
                        <span className="text-subtle">target</span> {evt.target}
                      </div>
                    </div>
                    <div className="w-24 flex justify-end shrink-0 pt-0.5">
                      <AlertSeverityBadge severity={evt.severity} />
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
