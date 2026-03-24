"use client";

import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import type { Base } from "@/lib/types";

// Fix Leaflet default icon paths broken by webpack
delete (L.Icon.Default.prototype as unknown as Record<string, unknown>)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
});

const DEFAULT_CENTER: [number, number] = [32.253, -110.911];
const DEFAULT_ZOOM = 12;

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

type BaseWithCoords = Base & { lat: number; lng: number };

interface LeafletMapSimpleProps {
  bases: BaseWithCoords[];
}

export default function LeafletMapSimple({ bases }: LeafletMapSimpleProps) {
  const center: [number, number] =
    bases.length > 0 ? [bases[0].lat, bases[0].lng] : DEFAULT_CENTER;

  return (
    <MapContainer
      center={center}
      zoom={DEFAULT_ZOOM}
      zoomControl={false}
      attributionControl={false}
      className="w-full h-full"
      style={{ background: "#0a0a0a" }}
    >
      <TileLayer
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        maxZoom={19}
      />

      {bases.map((base) => (
        <Marker key={base.id} position={[base.lat, base.lng]}>
          <Popup>
            <div className="font-mono text-xs">
              <div className="font-semibold">{base.name}</div>
              <div className="text-gray-500">{base.status}</div>
            </div>
          </Popup>
        </Marker>
      ))}

      {bases.length === 0 && (
        <div
          className="absolute inset-0 flex items-end justify-center pb-6 z-[1000] pointer-events-none"
        >
          <div className="bg-neutral-950/80 border border-neutral-800 rounded px-3 py-1.5 font-mono text-[11px] text-neutral-400">
            No bases with coordinates configured
          </div>
        </div>
      )}

      <ZoomControls />
    </MapContainer>
  );
}
