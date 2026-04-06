"use client";

import type { MissionStatus } from "@/lib/types";
import { missionStatusConfig } from "@/lib/mission-types";

interface MissionStatusBadgeProps {
  status: MissionStatus;
  size?: "sm" | "md";
}

export function MissionStatusBadge({ status, size = "sm" }: MissionStatusBadgeProps) {
  const config = missionStatusConfig[status] ?? missionStatusConfig.draft;
  const sizeClasses = size === "sm"
    ? "text-[10px] px-2 py-0.5"
    : "text-[11px] px-2.5 py-1";

  return (
    <span className={`font-mono tracking-wider uppercase rounded ${sizeClasses} ${config.color} ${config.bgColor} border border-neutral-700/50`}>
      {config.label}
    </span>
  );
}
