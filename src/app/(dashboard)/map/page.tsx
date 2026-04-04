"use client";

import { useMemo } from "react";
import { trpc } from "@/lib/trpc/client";
import { useTelemetryStream } from "@/hooks/use-telemetry-stream";
import dynamic from "next/dynamic";
import type { DroneOnMap } from "@/components/map/leaflet-map-simple";

// Dynamically import Leaflet map to avoid SSR issues
const LeafletMap = dynamic(() => import("@/components/map/leaflet-map-simple"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 flex items-center justify-center bg-neutral-950">
      <span className="font-mono text-[11px] text-neutral-500">Loading map…</span>
    </div>
  ),
});

export default function MapPage() {
  const { data: bases = [] } = trpc.bases.list.useQuery();
  const { data: nodes = [] } = trpc.nodes.list.useQuery();
  const { frames } = useTelemetryStream();

  // Extract bases that have coordinates for map markers
  const basesWithCoords = bases.filter(
    (b): b is typeof b & { lat: number; lng: number } =>
      typeof b.lat === "number" && typeof b.lng === "number"
  );

  // Build drone markers from live telemetry frames with GPS position
  const dronesOnMap = useMemo<DroneOnMap[]>(() => {
    const nodeMap = new Map(nodes.map((n) => [n.id, n]));
    const result: DroneOnMap[] = [];

    for (const [nodeId, frame] of frames) {
      if (!frame.position) continue;
      const node = nodeMap.get(nodeId);
      result.push({
        nodeId,
        name: node?.name ?? nodeId.slice(0, 8),
        frame,
      });
    }

    return result;
  }, [frames, nodes]);

  return (
    <div className="flex-1 flex flex-col min-h-0 overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-(--page-padding) py-2.5 border-b border-neutral-800 bg-neutral-950 shrink-0">
        <div className="flex items-center gap-3">
          <div className="text-[15px] font-semibold text-white tracking-tight">Map</div>
          <div className="font-mono text-[10px] text-neutral-500">
            {basesWithCoords.length} base{basesWithCoords.length !== 1 ? "s" : ""} · {nodes.length} drone{nodes.length !== 1 ? "s" : ""}
            {dronesOnMap.length > 0 && (
              <span className="text-fleet-green"> · {dronesOnMap.length} live</span>
            )}
          </div>
        </div>
      </div>

      {/* Map area */}
      <div className="flex-1 min-h-0 relative">
        <LeafletMap bases={basesWithCoords} drones={dronesOnMap} />
      </div>
    </div>
  );
}
