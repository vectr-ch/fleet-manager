"use client";

import { trpc } from "@/lib/trpc/client";
import { cn } from "@/lib/utils";
import type { AlertSeverity } from "@/lib/types";

const iconStyles: Record<AlertSeverity, string> = {
  warning: "bg-fleet-amber-dim text-fleet-amber border-fleet-amber/15",
  critical: "bg-fleet-red-dim text-fleet-red border-fleet-red/15",
  info: "bg-fleet-blue-dim text-fleet-blue border-fleet-blue/15",
};

const iconSymbols: Record<AlertSeverity, string> = {
  warning: "⚠",
  critical: "✕",
  info: "●",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  if (seconds < 60) return `${seconds}s ago`;
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  return `${Math.floor(minutes / 60)}h ago`;
}

export function AlertList() {
  const { data: alerts } = trpc.alerts.list.useQuery(undefined, { refetchInterval: 5000 });
  const utils = trpc.useUtils();
  const dismiss = trpc.alerts.dismiss.useMutation({
    onSuccess: () => utils.alerts.list.invalidate(),
  });

  if (!alerts) return null;

  return (
    <div>
      {alerts.map((alert) => (
        <div
          key={alert.id}
          className="flex gap-2.5 px-3.5 py-2.5 border-b border-border cursor-pointer hover:bg-bg transition-colors"
          onClick={() => dismiss.mutate({ id: alert.id })}
        >
          <div
            className={cn(
              "w-5 h-5 rounded flex items-center justify-center text-[10px] shrink-0 mt-px border",
              iconStyles[alert.severity]
            )}
          >
            {iconSymbols[alert.severity]}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-medium text-text">{alert.title}</div>
            <div className="text-[11px] text-text-dim mt-px">{alert.detail}</div>
          </div>
          <div className="font-mono text-[10px] text-subtle shrink-0">
            {timeAgo(alert.timestamp)}
          </div>
        </div>
      ))}
    </div>
  );
}
