"use client";

import { Polyline, CircleMarker } from "react-leaflet";
import type { GeneratedWaypoint } from "@/lib/waypoints";

interface WaypointPathProps {
  waypoints: GeneratedWaypoint[];
}

export function WaypointPath({ waypoints }: WaypointPathProps) {
  if (waypoints.length === 0) return null;

  const positions = waypoints.map((wp) => [wp.lat, wp.lng] as [number, number]);

  return (
    <>
      {/* Path line */}
      <Polyline
        positions={positions}
        pathOptions={{
          color: "#22c55e",
          weight: 1.5,
          opacity: 0.8,
          dashArray: "4 4",
        }}
      />

      {/* Waypoint dots */}
      {waypoints.map((wp) => (
        <CircleMarker
          key={`wp-${wp.index}`}
          center={[wp.lat, wp.lng]}
          radius={2}
          pathOptions={{
            color: "#22c55e",
            fillColor: "#22c55e",
            fillOpacity: 1,
            weight: 0,
          }}
        />
      ))}
    </>
  );
}
