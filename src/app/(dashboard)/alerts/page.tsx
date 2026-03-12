"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import { SummaryCard, SummaryCardGrid } from "@/components/dashboard/summary-card";
import { REFETCH_INTERVAL } from "@/lib/constants";
import type { AlertSeverity } from "@/lib/types";

type SeverityFilter = "all" | AlertSeverity;

const severityBadge: Record<AlertSeverity, string> = {
  info: "bg-fleet-blue-dim text-fleet-blue border-fleet-blue/15",
  warning: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  critical: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
};

const severityDot: Record<AlertSeverity, string> = {
  info: "bg-fleet-blue",
  warning: "bg-fleet-amber",
  critical: "bg-fleet-red",
};

function timeAgo(date: Date): string {
  const mins = Math.floor((Date.now() - new Date(date).getTime()) / 60_000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  return `${Math.floor(hrs / 24)}d ago`;
}

export default function AlertsPage() {
  const t = useTranslations("alertsPage");
  const [filter, setFilter] = useState<SeverityFilter>("all");
  const [acknowledged, setAcknowledged] = useState<Set<string>>(new Set());

  const { data: alerts } = trpc.alerts.list.useQuery(undefined, {
    refetchInterval: REFETCH_INTERVAL.SLOW,
  });

  const filtered = alerts?.filter((a) => filter === "all" || a.severity === filter) ?? [];
  const warningCount = alerts?.filter((a) => a.severity === "warning").length ?? 0;
  const criticalCount = alerts?.filter((a) => a.severity === "critical").length ?? 0;

  const handleAcknowledge = (id: string) => {
    setAcknowledged((prev) => new Set(prev).add(id));
  };

  const filters: { key: SeverityFilter; label: string }[] = [
    { key: "all", label: t("allAlerts") },
    { key: "critical", label: t("critical") },
    { key: "warning", label: t("warnings") },
    { key: "info", label: t("info") },
  ];

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-auto">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-border bg-card shrink-0">
        <div>
          <div className="text-[15px] font-semibold text-foreground tracking-tight">{t("title")}</div>
          <div className="text-[11px] text-muted-foreground font-mono mt-0.5">
            {t("subtitle", { total: alerts?.length ?? 0, active: warningCount + criticalCount })}
          </div>
        </div>
      </div>

      {/* Summary cards */}
      <div className="px-5 pt-4">
        <SummaryCardGrid>
          <SummaryCard label={t("totalAlerts")} value={alerts?.length ?? 0} meta={`${alerts?.length ?? 0} events`} />
          <SummaryCard label={t("warningAlerts")} value={warningCount} valueColor="text-fleet-amber" meta="requires attention" />
          <SummaryCard label={t("criticalAlerts")} value={criticalCount} valueColor={criticalCount > 0 ? "text-fleet-red" : undefined} meta={criticalCount === 0 ? "all clear" : "immediate action"} />
          <SummaryCard label={t("acknowledged")} value={acknowledged.size} meta={`of ${alerts?.length ?? 0} total`} />
        </SummaryCardGrid>
      </div>

      {/* Filters */}
      <div className="px-5 pt-4 pb-2 flex items-center gap-1 shrink-0">
        {filters.map(({ key, label }) => (
          <button
            key={key}
            onClick={() => setFilter(key)}
            className={cn(
              "font-mono text-[10px] tracking-wider uppercase px-3 py-1.5 rounded transition-colors",
              filter === key
                ? "bg-secondary text-foreground border border-input"
                : "text-subtle hover:text-muted-foreground border border-transparent"
            )}
          >
            {label}
          </button>
        ))}
        <div className="ml-auto font-mono text-[10px] text-subtle tracking-wider uppercase">
          {filtered.length} {filter === "all" ? "total" : filter}
        </div>
      </div>

      {/* Alerts list */}
      <div className="flex-1 px-5 pb-5 overflow-auto">
        {filtered.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="font-mono text-[11px] text-muted-foreground">{t("noAlerts")}</div>
            <div className="font-mono text-[10px] text-subtle mt-1">{t("allClear")}</div>
          </div>
        ) : (
          <div className="flex flex-col gap-2">
            {filtered.map((alert) => {
              const isAcked = acknowledged.has(alert.id);
              return (
                <div
                  key={alert.id}
                  className={cn(
                    "bg-card border border-border rounded-[5px] p-3.5 flex items-start gap-3 transition-opacity",
                    isAcked && "opacity-50"
                  )}
                >
                  {/* Severity indicator */}
                  <div className="pt-1 shrink-0">
                    <div className={cn("w-2 h-2 rounded-full", severityDot[alert.severity])} />
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1">
                      <span
                        className={cn(
                          "font-mono text-[9px] tracking-wider uppercase px-1.5 py-0.5 rounded border font-semibold",
                          severityBadge[alert.severity]
                        )}
                      >
                        {t(`severity${alert.severity.charAt(0).toUpperCase() + alert.severity.slice(1)}` as "severityInfo" | "severityWarning" | "severityCritical")}
                      </span>
                      <span className="font-mono text-[10px] text-subtle">{alert.id}</span>
                      <span className="font-mono text-[10px] text-subtle ml-auto">{timeAgo(alert.timestamp)}</span>
                    </div>
                    <div className="font-mono text-[11px] font-semibold text-foreground">{alert.title}</div>
                    <div className="font-mono text-[10px] text-muted-foreground mt-0.5">{alert.detail}</div>
                    {alert.droneId && (
                      <div className="font-mono text-[10px] text-subtle mt-1">
                        {t("drone")}: <span className="text-foreground">{alert.droneId}</span>
                      </div>
                    )}
                  </div>

                  {/* Acknowledge button */}
                  <button
                    onClick={() => handleAcknowledge(alert.id)}
                    disabled={isAcked}
                    className={cn(
                      "shrink-0 font-mono text-[9px] tracking-wider uppercase px-2.5 py-1 rounded-[5px] border transition-colors",
                      isAcked
                        ? "bg-secondary text-subtle border-border cursor-default"
                        : "bg-card text-muted-foreground border-input hover:bg-secondary hover:text-foreground"
                    )}
                  >
                    {isAcked ? t("acknowledged") : t("acknowledge")}
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
