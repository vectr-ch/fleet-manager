"use client";

import { useState } from "react";
import { trpc } from "@/lib/trpc/client";

const severityColors: Record<string, string> = {
  info:     "bg-blue-950 text-blue-400 border-blue-800",
  warning:  "bg-amber-950 text-amber-400 border-amber-800",
  critical: "bg-red-950 text-red-400 border-red-800",
};

const severityDot: Record<string, string> = {
  info:     "bg-blue-400",
  warning:  "bg-amber-400",
  critical: "bg-red-400",
};

function timeAgo(dateStr: string): string {
  const mins = Math.floor((Date.now() - new Date(dateStr).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

type SeverityFilter = "all" | "critical" | "warning" | "info";

export default function AlertsPage() {
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const { data: alerts = [], isLoading } = trpc.alerts.list.useQuery();

  const filtered = filter === "all" ? alerts : alerts.filter((a) => a.severity === filter);

  const criticalCount = alerts.filter((a) => a.severity === "critical").length;
  const warningCount  = alerts.filter((a) => a.severity === "warning").length;

  const filters: { key: SeverityFilter; label: string }[] = [
    { key: "all",      label: "All Alerts" },
    { key: "critical", label: "Critical" },
    { key: "warning",  label: "Warnings" },
    { key: "info",     label: "Info" },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-(--page-padding) py-3 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div>
          <h1 className="text-[15px] font-semibold text-white tracking-tight">Alerts</h1>
          <div className="font-mono text-[11px] text-neutral-400 mt-0.5">
            {alerts.length} total &middot; {criticalCount + warningCount} active
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 gap-3 px-(--page-padding) pt-4">
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">Critical</div>
          <div className={`font-mono text-2xl font-semibold ${criticalCount > 0 ? "text-red-400" : "text-neutral-300"}`}>{criticalCount}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">Warning</div>
          <div className={`font-mono text-2xl font-semibold ${warningCount > 0 ? "text-amber-400" : "text-neutral-300"}`}>{warningCount}</div>
        </div>
        <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-4">
          <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase mb-1">Total</div>
          <div className="font-mono text-2xl font-semibold text-neutral-300">{alerts.length}</div>
        </div>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-1 px-(--page-padding) pt-4 pb-2 shrink-0 overflow-x-auto">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={`shrink-0 font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded transition-colors ${
              filter === key
                ? "bg-neutral-800 text-white border border-neutral-700"
                : "text-neutral-500 hover:text-neutral-300 border border-transparent"
            }`}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto font-mono text-[10px] text-neutral-600 tracking-wider uppercase">
          {filtered.length} shown
        </div>
      </div>

      {/* Alert list */}
      <div className="flex-1 px-(--page-padding) pb-5 overflow-auto">
        {isLoading ? (
          <div className="flex items-center justify-center py-16">
            <span className="font-mono text-[11px] text-neutral-500">Loading…</span>
          </div>
        ) : filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-2 text-center">
            <span className="font-mono text-[13px] text-neutral-400">No alerts</span>
            <span className="font-mono text-[11px] text-neutral-600">All systems nominal</span>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((alert) => (
              <div
                key={alert.id}
                className="bg-neutral-900 border border-neutral-800 rounded-[5px] p-3.5 flex items-start gap-3"
              >
                <div className="pt-1 shrink-0">
                  <div className={`w-2 h-2 rounded-full ${severityDot[alert.severity] ?? "bg-neutral-500"}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className={`font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded border font-semibold ${severityColors[alert.severity] ?? "bg-neutral-800 text-neutral-400 border-neutral-700"}`}>
                      {alert.severity}
                    </span>
                    <span className="font-mono text-[10px] text-neutral-600">{alert.id}</span>
                    <span className="font-mono text-[10px] text-neutral-600 ml-auto">
                      {timeAgo(alert.created_at)}
                    </span>
                  </div>
                  <div className="font-mono text-[11px] font-semibold text-white">{alert.title}</div>
                  {alert.detail && (
                    <div className="font-mono text-[10px] text-neutral-400 mt-0.5">{alert.detail}</div>
                  )}
                  {alert.node_id && (
                    <div className="font-mono text-[10px] text-neutral-600 mt-1">
                      Drone: <span className="text-neutral-400">{alert.node_id}</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
