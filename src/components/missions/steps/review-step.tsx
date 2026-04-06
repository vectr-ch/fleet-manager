"use client";

import type { MissionConfig } from "@/app/(dashboard)/missions/new/page";
import type { LatLng, GeneratedWaypoint } from "@/lib/waypoints";
import { abortActionLabels } from "@/lib/mission-types";
import { trpc } from "@/lib/trpc/client";

interface ReviewStepProps {
  config: MissionConfig;
  polygon: LatLng[];
  waypoints: GeneratedWaypoint[];
}

export function ReviewStep({ config, polygon, waypoints }: ReviewStepProps) {
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const selectedBase = bases.find((b) => b.id === config.baseId);

  // Estimate flight distance from waypoints
  const distanceKm = waypoints.reduce((acc, wp, i) => {
    if (i === 0) return 0;
    const prev = waypoints[i - 1];
    const dlat = (wp.lat - prev.lat) * 111320;
    const dlng = (wp.lng - prev.lng) * 111320 * Math.cos((wp.lat * Math.PI) / 180);
    return acc + Math.sqrt(dlat * dlat + dlng * dlng);
  }, 0) / 1000;

  const flightTimeMin = config.params.speed_ms > 0 ? (distanceKm * 1000) / config.params.speed_ms / 60 : 0;

  const rows: { label: string; value: string }[] = [
    { label: "Mission Type", value: config.type.replace("_", " ") },
    { label: "Base Station", value: selectedBase?.name ?? "\u2014" },
    { label: "Drone Count", value: `${config.droneCount} (min: ${config.minDroneCount})` },
    { label: "Spacing", value: `${config.params.spacing_m}m` },
    { label: "Altitude", value: `${config.params.altitude_m}m AGL` },
    { label: "Speed", value: `${config.params.speed_ms} m/s` },
    { label: "Loop", value: config.params.loop ? "Yes" : "No" },
    { label: "Abort Action", value: abortActionLabels[config.abortAction.action] ?? config.abortAction.action },
    { label: "Polygon Vertices", value: `${polygon.length}` },
    { label: "Waypoints", value: `${waypoints.length}` },
    { label: "Est. Distance", value: `${distanceKm.toFixed(2)} km` },
    { label: "Est. Flight Time", value: `${flightTimeMin.toFixed(1)} min` },
  ];

  return (
    <div className="space-y-4">
      <div className="font-mono text-[10px] tracking-wider text-neutral-500 uppercase">
        Mission Summary
      </div>

      <div className="bg-neutral-900 border border-neutral-800 rounded-[5px] divide-y divide-neutral-800">
        {rows.map((row) => (
          <div key={row.label} className="flex items-center justify-between px-3 py-2">
            <span className="font-mono text-[10px] text-neutral-500">{row.label}</span>
            <span className="font-mono text-[11px] text-white">{row.value}</span>
          </div>
        ))}
      </div>

      <div className="bg-neutral-800/50 rounded-[5px] p-3">
        <p className="font-mono text-[10px] text-neutral-400">
          This will create a draft mission. You can review and submit it for approval from the mission detail page.
        </p>
      </div>
    </div>
  );
}
