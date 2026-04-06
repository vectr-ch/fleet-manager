"use client";

import { use } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { MissionDetailPanel } from "@/components/missions/mission-detail-panel";
import type { LatLng, GeneratedWaypoint } from "@/lib/waypoints";

const MissionMap = dynamic(() => import("@/components/map/mission-map"), { ssr: false });

export default function MissionDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const router = useRouter();
  const { data, isLoading, error } = trpc.missions.getById.useQuery({ id });

  if (isLoading) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-mono text-[11px] text-neutral-500">Loading mission…</span>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <span className="font-mono text-[11px] text-red-400">{error?.message ?? "Mission not found"}</span>
      </div>
    );
  }

  const { mission, nodes, events } = data;

  // Extract polygon from mission params
  const polygon: LatLng[] = (() => {
    try {
      const params = mission.params as { area?: { coordinates?: number[][][] } };
      const coords = params?.area?.coordinates?.[0];
      if (!coords) return [];
      return coords.map((c) => ({ lat: c[1], lng: c[0] }));
    } catch {
      return [];
    }
  })();

  // Extract waypoints
  const waypoints: GeneratedWaypoint[] = (() => {
    try {
      if (!mission.waypoints) return [];
      if (Array.isArray(mission.waypoints)) return mission.waypoints;
      return [];
    } catch {
      return [];
    }
  })();

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative">
        <MissionMap
          mode="view"
          polygon={polygon}
          polygonClosed={polygon.length >= 3}
          waypoints={waypoints}
          bases={[]}
          selectedBaseId={mission.base_id}
        />
      </div>

      {/* Detail panel */}
      <div className="w-[420px] border-l border-neutral-800 bg-[#0a0a0a] overflow-y-auto">
        <MissionDetailPanel
          mission={mission}
          nodes={nodes}
          events={events}
          onBack={() => router.push("/missions")}
        />
      </div>
    </div>
  );
}
