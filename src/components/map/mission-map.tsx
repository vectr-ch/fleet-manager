"use client";

import { MapContainer, TileLayer, Marker, Popup, Polygon, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect } from "react";
import { PolygonDraw } from "./polygon-draw";
import { WaypointPath } from "./waypoint-path";
import type { LatLng, GeneratedWaypoint } from "@/lib/waypoints";
import type { Base } from "@/lib/types";

// Fix Leaflet default icon paths
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [32.253, -110.911];
const DEFAULT_ZOOM = 14;

// Custom base marker icon
const baseIcon = L.divIcon({
  className: "",
  html: '<div style="width:12px;height:12px;background:#3b82f6;border:2px solid #1d4ed8;border-radius:2px;"></div>',
  iconSize: [12, 12],
  iconAnchor: [6, 6],
});

function ZoomControls() {
  const map = useMap();
  return (
    <div className="absolute bottom-3 right-3 flex gap-1 z-[1000]">
      <button
        onClick={() => map.zoomIn()}
        className="w-7 h-7 bg-neutral-950/80 border border-neutral-700 rounded flex items-center justify-center text-neutral-400 text-xs backdrop-blur-sm hover:text-white"
      >
        +
      </button>
      <button
        onClick={() => map.zoomOut()}
        className="w-7 h-7 bg-neutral-950/80 border border-neutral-700 rounded flex items-center justify-center text-neutral-400 text-xs backdrop-blur-sm hover:text-white"
      >
        −
      </button>
    </div>
  );
}

function FitBounds({ polygon }: { polygon: LatLng[] }) {
  const map = useMap();
  useEffect(() => {
    if (polygon.length >= 2) {
      const bounds = L.latLngBounds(polygon.map((p) => [p.lat, p.lng]));
      map.fitBounds(bounds, { padding: [40, 40] });
    }
  }, [polygon, map]);
  return null;
}

interface MissionMapProps {
  mode: "draw" | "view";
  polygon: LatLng[];
  polygonClosed: boolean;
  onPolygonChange?: (vertices: LatLng[]) => void;
  onPolygonClose?: () => void;
  waypoints: GeneratedWaypoint[];
  bases?: (Base & { lat: number; lng: number })[];
  selectedBaseId?: string | null;
  center?: [number, number];
}

export default function MissionMap({
  mode,
  polygon,
  polygonClosed,
  onPolygonChange,
  onPolygonClose,
  waypoints,
  bases = [],
  selectedBaseId,
  center,
}: MissionMapProps) {
  const mapCenter = center ?? (bases.length > 0 ? [bases[0].lat, bases[0].lng] : DEFAULT_CENTER) as [number, number];

  return (
    <div className="relative w-full h-full">
      <MapContainer
        center={mapCenter}
        zoom={DEFAULT_ZOOM}
        zoomControl={false}
        attributionControl={false}
        doubleClickZoom={mode === "view"}
        className="w-full h-full"
        style={{ background: "#0a0a0a" }}
      >
        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          maxZoom={19}
        />

        {/* Base markers */}
        {bases.map((base) => (
          <Marker
            key={base.id}
            position={[base.lat, base.lng]}
            icon={baseIcon}
            opacity={selectedBaseId && base.id !== selectedBaseId ? 0.4 : 1}
          >
            <Popup>
              <div className="font-mono text-xs">
                <div className="font-semibold">{base.name}</div>
                <div className="text-gray-500">{base.status}</div>
              </div>
            </Popup>
          </Marker>
        ))}

        {/* Polygon drawing (draw mode) */}
        {mode === "draw" && onPolygonChange && onPolygonClose && (
          <PolygonDraw
            polygon={polygon}
            onPolygonChange={onPolygonChange}
            closed={polygonClosed}
            onClose={onPolygonClose}
          />
        )}

        {/* Static polygon (view mode) */}
        {mode === "view" && polygon.length >= 3 && (
          <Polygon
            positions={polygon.map((p) => [p.lat, p.lng] as [number, number])}
            pathOptions={{ color: "#3b82f6", fillColor: "#3b82f6", fillOpacity: 0.15, weight: 2 }}
          />
        )}

        {/* Waypoint path overlay */}
        <WaypointPath waypoints={waypoints} />

        {/* Fit to polygon bounds */}
        {polygon.length >= 2 && <FitBounds polygon={polygon} />}

        <ZoomControls />
      </MapContainer>

      {/* Instruction overlay for draw mode */}
      {mode === "draw" && !polygonClosed && (
        <div className="absolute top-3 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none">
          <div className="bg-neutral-950/80 border border-neutral-800 rounded px-3 py-1.5 font-mono text-[11px] text-neutral-400 backdrop-blur-sm">
            {polygon.length === 0
              ? "Click on the map to draw surveillance area"
              : polygon.length < 3
                ? `${polygon.length} point${polygon.length > 1 ? "s" : ""} — need at least 3`
                : "Double-click to close the polygon"}
          </div>
        </div>
      )}

      {/* Waypoint count */}
      {waypoints.length > 0 && (
        <div className="absolute bottom-3 left-3 z-[1000] pointer-events-none">
          <div className="bg-neutral-950/80 border border-neutral-800 rounded px-2.5 py-1 font-mono text-[10px] text-green-400 backdrop-blur-sm">
            {waypoints.length} waypoints
          </div>
        </div>
      )}
    </div>
  );
}
