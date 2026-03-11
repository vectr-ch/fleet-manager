"use client";

import { cn } from "@/lib/utils";
import { useDroneSelection } from "@/hooks/use-drone-selection";
import { useTranslations } from "next-intl";
import type { Drone } from "@/lib/types";

const statusDotClass = {
  nominal: "bg-fleet-green shadow-[0_0_4px_#22c55e88]",
  warning: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  critical: "bg-fleet-red shadow-[0_0_4px_#ef444488]",
  rtb: "bg-fleet-amber shadow-[0_0_4px_#f59e0b88]",
  offline: "bg-muted",
} as const;

function batteryBarClass(battery: number) {
  if (battery > 50) return "bg-fleet-green";
  if (battery > 25) return "bg-fleet-amber";
  return "bg-fleet-red";
}

interface DroneListItemProps {
  drone: Drone;
}

export function DroneListItem({ drone }: DroneListItemProps) {
  const { selectedDroneId, selectDrone } = useDroneSelection();
  const t = useTranslations("fleet");
  const isSelected = selectedDroneId === drone.id;
  const isWarning = drone.status === "warning" || drone.status === "critical";

  return (
    <div
      onClick={() => selectDrone(drone.id)}
      className={cn(
        "flex items-center px-3.5 py-2.5 border-b border-border gap-2.5 cursor-pointer transition-colors",
        isSelected && "bg-border",
        !isSelected && "hover:bg-bg",
        isWarning && !isSelected && "bg-fleet-amber/[0.02] border-l-2 border-l-fleet-amber"
      )}
    >
      <div className={cn("w-[7px] h-[7px] rounded-full shrink-0", statusDotClass[drone.status])} />

      <div className="flex-1 min-w-0">
        <div className="font-mono text-[11px] font-medium text-text">
          {drone.id}
          {isWarning && (
            <span className="text-fleet-amber text-[10px] ml-1">⚠ {t("lowBattery")}</span>
          )}
        </div>
        <div className="text-[11px] text-text-dim mt-px">
          {drone.role.charAt(0).toUpperCase() + drone.role.slice(1)} · Grid pos {drone.gridPos.row},{drone.gridPos.col}
        </div>
      </div>

      <div className="flex flex-col items-end gap-1">
        <div className="flex items-center gap-1 font-mono text-[10px] text-subtle">
          <span>{t("battery")}</span>
          <span className={cn(drone.battery > 50 ? "text-fleet-green" : drone.battery > 25 ? "text-fleet-amber" : "text-fleet-red")}>
            {Math.round(drone.battery)}%
          </span>
        </div>
        <div className="w-7 h-1 bg-border2 rounded-sm overflow-hidden">
          <div
            className={cn("h-full rounded-sm", batteryBarClass(drone.battery))}
            style={{ width: `${drone.battery}%` }}
          />
        </div>
      </div>
    </div>
  );
}
