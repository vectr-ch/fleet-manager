"use client";

import type { MissionConfig } from "@/app/(dashboard)/missions/new/page";
import { SurveillanceParams } from "../params/surveillance-params";

interface ConfigureStepProps {
  missionType: string;
  config: MissionConfig;
  onConfigChange: (config: MissionConfig) => void;
  polygonClosed: boolean;
  waypointCount: number;
}

export function ConfigureStep({ missionType, config, onConfigChange, polygonClosed, waypointCount }: ConfigureStepProps) {
  return (
    <div className="space-y-5">
      {/* Drawing status */}
      <div className="flex items-center gap-2">
        <div className={`w-2 h-2 rounded-full ${polygonClosed ? "bg-green-500" : "bg-amber-500 animate-pulse"}`} />
        <span className="font-mono text-[11px] text-neutral-400">
          {polygonClosed
            ? `Area defined \u2014 ${waypointCount} waypoints generated`
            : "Draw the surveillance area on the map"}
        </span>
      </div>

      {/* Type-specific params */}
      {missionType === "surveillance" && (
        <SurveillanceParams config={config} onConfigChange={onConfigChange} />
      )}

      {/* Fallback for unimplemented types */}
      {missionType !== "surveillance" && (
        <div className="bg-neutral-800 rounded-[5px] p-4 font-mono text-[11px] text-neutral-500">
          Configuration for this mission type is not yet available.
        </div>
      )}
    </div>
  );
}
