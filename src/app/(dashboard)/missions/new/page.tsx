"use client";

import { useState, useMemo, useCallback } from "react";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import { trpc } from "@/lib/trpc/client";
import { generateWaypoints, type LatLng, type GeneratedWaypoint } from "@/lib/waypoints";
import { MissionCreationPanel } from "@/components/missions/mission-creation-panel";

const MissionMap = dynamic(() => import("@/components/map/mission-map"), { ssr: false });

export interface MissionConfig {
  type: string;
  mode: string;
  params: {
    area?: { type: string; coordinates: number[][][] };
    spacing_m: number;
    altitude_m: number;
    speed_ms: number;
    loop: boolean;
  };
  abortAction: { action: string; options: Record<string, unknown> };
  baseId: string | null;
  droneCount: number;
  minDroneCount: number;
}

const defaultConfig: MissionConfig = {
  type: "",
  mode: "autonomous",
  params: { spacing_m: 30, altitude_m: 50, speed_ms: 5, loop: true },
  abortAction: { action: "return_to_base", options: { land_at: "takeoff_position" } },
  baseId: null,
  droneCount: 1,
  minDroneCount: 1,
};

export default function NewMissionPage() {
  const router = useRouter();
  const [config, setConfig] = useState<MissionConfig>(defaultConfig);
  const [polygon, setPolygon] = useState<LatLng[]>([]);
  const [polygonClosed, setPolygonClosed] = useState(false);
  const [currentStep, setCurrentStep] = useState(0);

  const { data: bases = [] } = trpc.bases.list.useQuery();
  const basesWithCoords = bases.filter(
    (b): b is typeof b & { lat: number; lng: number } => b.lat != null && b.lng != null,
  );

  // Generate waypoints when polygon or params change
  const waypoints = useMemo<GeneratedWaypoint[]>(() => {
    if (!polygonClosed || polygon.length < 3) return [];
    return generateWaypoints(polygon, {
      spacingM: config.params.spacing_m,
      altitudeM: config.params.altitude_m,
      speedMS: config.params.speed_ms,
    });
  }, [polygon, polygonClosed, config.params.spacing_m, config.params.altitude_m, config.params.speed_ms]);

  const handlePolygonChange = useCallback((vertices: LatLng[]) => {
    setPolygon(vertices);
    // Update config.params.area with GeoJSON
    if (vertices.length >= 3) {
      const coords = [...vertices, vertices[0]].map((v) => [v.lng, v.lat]);
      setConfig((prev) => ({
        ...prev,
        params: {
          ...prev.params,
          area: { type: "Polygon", coordinates: [coords] },
        },
      }));
    }
  }, []);

  const handlePolygonClose = useCallback(() => {
    setPolygonClosed(true);
  }, []);

  const handleClearPolygon = useCallback(() => {
    setPolygon([]);
    setPolygonClosed(false);
    setConfig((prev) => ({
      ...prev,
      params: { ...prev.params, area: undefined },
    }));
  }, []);

  const utils = trpc.useUtils();
  const createMutation = trpc.missions.create.useMutation({
    onSuccess: (mission) => {
      utils.missions.list.invalidate();
      // Generate waypoints on backend after creation
      if (waypoints.length > 0) {
        generateWpMutation.mutate({
          id: mission.id,
          spacing_m: config.params.spacing_m,
          altitude_m: config.params.altitude_m,
          speed_ms: config.params.speed_ms,
        });
      } else {
        router.push(`/missions/${mission.id}`);
      }
    },
  });

  const generateWpMutation = trpc.missions.generateWaypoints.useMutation({
    onSuccess: (mission) => {
      router.push(`/missions/${mission.id}`);
    },
  });

  const handleCreate = () => {
    createMutation.mutate({
      type: config.type,
      mode: config.mode,
      base_id: config.baseId ?? undefined,
      params: config.params,
      abort_action: config.abortAction,
      drone_count: config.droneCount,
      min_drone_count: config.minDroneCount,
    });
  };

  const isMapStep = currentStep === 1; // Configure step shows draw mode

  return (
    <div className="flex-1 flex min-h-0 overflow-hidden">
      {/* Map */}
      <div className="flex-1 relative">
        <MissionMap
          mode={isMapStep ? "draw" : "view"}
          polygon={polygon}
          polygonClosed={polygonClosed}
          onPolygonChange={handlePolygonChange}
          onPolygonClose={handlePolygonClose}
          waypoints={waypoints}
          bases={basesWithCoords}
          selectedBaseId={config.baseId}
        />

        {/* Clear polygon button */}
        {polygon.length > 0 && isMapStep && (
          <button
            onClick={handleClearPolygon}
            className="absolute top-3 right-3 z-[1000] bg-neutral-950/80 border border-neutral-700 rounded px-2.5 py-1 font-mono text-[10px] text-neutral-400 hover:text-white backdrop-blur-sm"
          >
            Clear Area
          </button>
        )}
      </div>

      {/* Config panel */}
      <div className="w-[420px] border-l border-neutral-800 bg-[#0a0a0a] overflow-y-auto">
        <MissionCreationPanel
          config={config}
          onConfigChange={setConfig}
          currentStep={currentStep}
          onStepChange={setCurrentStep}
          polygon={polygon}
          polygonClosed={polygonClosed}
          waypoints={waypoints}
          onCreate={handleCreate}
          isCreating={createMutation.isPending || generateWpMutation.isPending}
          error={createMutation.error?.message ?? generateWpMutation.error?.message ?? null}
        />
      </div>
    </div>
  );
}
