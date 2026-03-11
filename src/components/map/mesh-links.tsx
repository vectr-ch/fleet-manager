"use client";

import { Polyline } from "react-leaflet";
import type { Drone, MeshLink } from "@/lib/types";

interface MeshLinksLayerProps {
  drones: Drone[];
  meshLinks: MeshLink[];
}

export function MeshLinksLayer({ drones, meshLinks }: MeshLinksLayerProps) {
  const droneMap = new Map(drones.map((d) => [d.id, d]));

  return (
    <>
      {meshLinks.map((link) => {
        const from = droneMap.get(link.from);
        const to = droneMap.get(link.to);
        if (!from || !to) return null;

        const isWarn = from.status === "warning" || to.status === "warning";

        return (
          <Polyline
            key={`${link.from}-${link.to}`}
            positions={[
              [from.position.lat, from.position.lng],
              [to.position.lat, to.position.lng],
            ]}
            pathOptions={{
              color: isWarn ? "#f59e0b" : "#22c55e",
              weight: 1,
              opacity: isWarn ? 0.25 : 0.18,
              dashArray: isWarn ? "3,5" : undefined,
            }}
          />
        );
      })}
    </>
  );
}
