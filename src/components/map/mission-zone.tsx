"use client";

import { Polygon, Polyline, Tooltip } from "react-leaflet";
import type { Mission } from "@/lib/types";

interface MissionZoneProps {
  mission: Mission;
}

export function MissionZone({ mission }: MissionZoneProps) {
  const positions = mission.bounds.map(
    (b) => [b.lat, b.lng] as [number, number]
  );

  // Coverage area (bottom portion based on coverage %)
  const coverageFraction = mission.coverage / 100;
  const minLat = Math.min(...mission.bounds.map((b) => b.lat));
  const maxLat = Math.max(...mission.bounds.map((b) => b.lat));
  const coverageLat = minLat + (maxLat - minLat) * coverageFraction;
  const minLng = Math.min(...mission.bounds.map((b) => b.lng));
  const maxLng = Math.max(...mission.bounds.map((b) => b.lng));

  const coveragePositions: [number, number][] = [
    [minLat, minLng],
    [minLat, maxLng],
    [coverageLat, maxLng],
    [coverageLat, minLng],
  ];

  // Scan lines across the coverage area
  const scanLines: [number, number][][] = [];
  const lineCount = 7;
  for (let i = 0; i < lineCount; i++) {
    const lat = minLat + i * ((coverageLat - minLat) / lineCount);
    scanLines.push([
      [lat, minLng],
      [lat, maxLng],
    ]);
  }

  // Waypoint rows (planned route)
  const waypointRows: [number, number][][] = [
    [[32.261, -110.928], [32.261, -110.895]],
    [[32.255, -110.895], [32.255, -110.928]],
    [[32.249, -110.928], [32.249, -110.895]],
  ];

  return (
    <>
      {/* Mission zone outline */}
      <Polygon
        positions={positions}
        pathOptions={{
          color: "#3b82f6",
          weight: 1.5,
          opacity: 0.5,
          fillColor: "#3b82f6",
          fillOpacity: 0.04,
          dashArray: "4,6",
        }}
      >
        <Tooltip
          permanent
          direction="top"
          className="zone-label"
          offset={[0, -4]}
        >
          <span style={{ fontFamily: "monospace", fontSize: "10px", color: "#3b82f6", letterSpacing: "0.08em" }}>
            MISSION AREA · ALPHA-7
          </span>
        </Tooltip>
      </Polygon>

      {/* Coverage fill */}
      <Polygon
        positions={coveragePositions}
        pathOptions={{
          color: "#3b82f6",
          weight: 0,
          fillColor: "#3b82f6",
          fillOpacity: 0.07,
        }}
      />

      {/* Scan lines */}
      {scanLines.map((line, i) => (
        <Polyline
          key={`scan-${i}`}
          positions={line}
          pathOptions={{ color: "#3b82f6", weight: 0.6, opacity: 0.15 }}
        />
      ))}

      {/* Waypoint route */}
      {waypointRows.map((pts, i) => (
        <Polyline
          key={`wp-${i}`}
          positions={pts}
          pathOptions={{ color: "#3b82f6", weight: 1, opacity: 0.12, dashArray: "3,5" }}
        />
      ))}
    </>
  );
}
