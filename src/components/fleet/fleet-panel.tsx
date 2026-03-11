"use client";

import { trpc } from "@/lib/trpc/client";
import { FormationBar } from "./formation-bar";
import { TelemetrySummary } from "./telemetry-summary";
import { DroneListItem } from "./drone-list-item";

export function FleetPanel() {
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });

  if (!drones || !mission) return null;

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="shrink-0">
        <FormationBar mission={mission} />
        <TelemetrySummary drones={drones} />
      </div>
      <div className="flex-1 overflow-y-auto scrollbar-thin">
        {drones.map((drone) => (
          <DroneListItem key={drone.id} drone={drone} />
        ))}
      </div>
    </div>
  );
}
