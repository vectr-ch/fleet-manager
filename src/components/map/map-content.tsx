"use client";

import { MapContainer, TileLayer, useMap } from "react-leaflet";
import { trpc } from "@/lib/trpc/client";
import { DroneMarkers } from "./drone-markers";
import { MissionZone } from "./mission-zone";
import { MeshLinksLayer } from "./mesh-links";
import { BaseMarkerLayer } from "./base-marker";
import { MapOverlays } from "./map-overlays";
import "leaflet/dist/leaflet.css";

const CENTER: [number, number] = [32.253, -110.911];
const ZOOM = 14;

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 flex gap-1 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-[#0a0a0acc] border border-input rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-foreground hover:border-muted"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-[#0a0a0acc] border border-input rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-foreground hover:border-muted"
      >
        −
      </button>
      <button
        onClick={() => map.setView(CENTER, ZOOM)}
        className="w-7 h-7 bg-[#0a0a0acc] border border-input rounded flex items-center justify-center text-subtle text-xs backdrop-blur-sm hover:text-foreground hover:border-muted"
      >
        ⊙
      </button>
    </div>
  );
}

export function MapContent() {
  const { data: drones } = trpc.drones.list.useQuery(undefined, { refetchInterval: 2000 });
  const { data: mission } = trpc.missions.active.useQuery(undefined, { refetchInterval: 2000 });
  const { data: meshLinks } = trpc.meshLinks.useQuery(undefined, { refetchInterval: 2000 });
  const { data: baseStations } = trpc.baseStations.useQuery(undefined, { refetchInterval: 2000 });

  return (
    <MapContainer
      center={CENTER}
      zoom={ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "var(--background)" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {mission && <MissionZone mission={mission} />}
      {drones && meshLinks && <MeshLinksLayer drones={drones} meshLinks={meshLinks} />}
      {drones && <DroneMarkers drones={drones} />}
      {baseStations?.map((base) => (
        <BaseMarkerLayer key={base.id} base={base} drones={drones ?? []} />
      ))}

      <ZoomControls />
      <MapOverlays mission={mission ?? null} />
    </MapContainer>
  );
}
